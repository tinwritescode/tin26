import { inject, injectable } from 'inversify'
import { TYPES as ServiceTypes } from '../services/types.js'
import { TYPES as RepositoryTypes } from '../repositories/types.js'
import type { Request, Response } from 'express'
import type { IJwtService, IWorkOSService } from '../services/interfaces.js'
import type { IUserRepository } from '../repositories/interfaces.js'
import type { IAuthController } from './interfaces.js'

if (!process.env.WORKOS_CLIENT_ID) {
  throw new Error('WORKOS_CLIENT_ID is not set')
}

if (!process.env.WORKOS_REDIRECT_URI) {
  throw new Error('WORKOS_REDIRECT_URI is not set')
}

const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID
const getWorkOSRedirectUri = (): string => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  return process.env.WORKOS_REDIRECT_URI || `${frontendUrl}/api/auth/callback`
}

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject(ServiceTypes.WorkOSService) private workosService: IWorkOSService,
    @inject(ServiceTypes.JwtService) private jwtService: IJwtService,
    @inject(RepositoryTypes.UserRepository)
    private userRepository: IUserRepository,
  ) {}

  login(_req: Request, res: Response): void {
    const authorizationUrl = this.workosService.getAuthorizationUrl(
      getWorkOSRedirectUri(),
      WORKOS_CLIENT_ID,
    )
    res.redirect(authorizationUrl)
  }

  async callback(req: Request, res: Response): Promise<void> {
    const { code } = req.query

    if (!code || typeof code !== 'string') {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      res.status(400).redirect(`${frontendUrl}/login?error=no_code`)
      return
    }

    try {
      const workosUser = await this.workosService.authenticateWithCode(
        code,
        WORKOS_CLIENT_ID,
      )

      // Find or create user in database
      let user = await this.userRepository.findByWorkosId(workosUser.id)

      if (!user) {
        user = await this.userRepository.create({
          workosId: workosUser.id,
          email: workosUser.email,
          firstName: workosUser.firstName || null,
          lastName: workosUser.lastName || null,
        })
      } else {
        // Update user if needed
        user = await this.userRepository.update(user.id, {
          email: workosUser.email,
          firstName: workosUser.firstName || null,
          lastName: workosUser.lastName || null,
        })
      }

      // Generate JWT token
      const token = this.jwtService.generateToken({
        userId: user.id,
        email: user.email,
        workosId: user.workosId,
      })

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
    } catch (error) {
      console.error('Authentication error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      console.error('Error details:', {
        message: errorMessage,
        code: req.query.code,
        redirectUri: getWorkOSRedirectUri(),
      })
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

      // Check if it's a database connection error
      if (
        errorMessage.includes('Connection terminated') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('connect')
      ) {
        console.error(
          'Database connection error - check if database is running and DATABASE_URL is correct',
        )
        res.status(500).redirect(`${frontendUrl}/login?error=database_error`)
        return
      }

      res
        .status(500)
        .redirect(`${frontendUrl}/login?error=authentication_failed`)
    }
  }
}
