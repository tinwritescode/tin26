export interface User {
  id: string
  workosId: string
  email: string
  firstName: string | null
  lastName: string | null
  createdAt: Date
  updatedAt: Date
}

export interface JWTPayload {
  userId: string
  email: string
  workosId: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: () => void
  logout: () => void
  getToken: () => string | null
  setToken: (token: string) => void
}
