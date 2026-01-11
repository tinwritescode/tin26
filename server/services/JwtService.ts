import { injectable } from 'inversify'
import jwt from 'jsonwebtoken'
import type { Request } from 'express'
import type { JWTPayload } from '../../types/auth.js'
import type { IJwtService } from './interfaces.js'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

@injectable()
export class JwtService implements IJwtService {
  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions)
  }

  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
      return decoded
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    return authHeader.substring(7)
  }
}
