import type { RouterOutput } from '../lib/trpc'
import type { User as PrismaUser } from '@prisma/client'

export type User = PrismaUser

export interface JWTPayload {
  userId: string
  email: string
  workosId: string
}

export interface AuthContextType {
  isLoading: boolean
  login: () => void
  logout: () => void
  getToken: () => string | null
  setToken: (token: string) => void
}
