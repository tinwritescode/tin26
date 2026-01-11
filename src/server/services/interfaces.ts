import type { JWTPayload } from '../../types/auth.js'
import type { Request } from 'express'

export interface IWorkOSService {
  getAuthorizationUrl: (redirectUri: string, clientId: string) => string
  authenticateWithCode: (
    code: string,
    clientId: string,
  ) => Promise<{
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    sealedSession?: string | null
  }>
  getLogoutUrl: (redirectUri: string, clientId: string) => string
  getLogoutUrlFromSession: (
    sessionCookie: string | undefined,
    redirectUri: string,
  ) => Promise<string | null>
}

export interface IJwtService {
  generateToken: (payload: JWTPayload) => string
  verifyToken: (token: string) => JWTPayload
  extractTokenFromHeader: (req: Request) => string | null
}
