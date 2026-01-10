import { container } from '../container.js'
import { TYPES as ServiceTypes } from '../services/types.js'
import { TYPES as RepositoryTypes } from '../repositories/types.js'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import type { IJwtService } from '../services/interfaces.js'
import type { IUserRepository } from '../repositories/interfaces.js'
import type { User } from '../../types/auth.js'

export async function createContext(opts?: CreateExpressContextOptions) {
  // Resolve services and repositories from container
  const jwtService = container.get<IJwtService>(ServiceTypes.JwtService)
  const userRepository = container.get<IUserRepository>(
    RepositoryTypes.UserRepository,
  )

  let user: User | null = null
  let isAuthenticated = false

  if (opts?.req) {
    const token = jwtService.extractTokenFromHeader(opts.req)
    if (token) {
      try {
        const payload = jwtService.verifyToken(token)
        const dbUser = await userRepository.findById(payload.userId)
        if (dbUser) {
          user = dbUser
          isAuthenticated = true
        }
      } catch (error) {
        // Token is invalid or expired, user remains null
      }
    }
  }

  return {
    jwtService,
    userRepository,
    user,
    isAuthenticated,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
