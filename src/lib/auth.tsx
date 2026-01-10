import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthContextType, User } from '../types/auth.js'

const TOKEN_KEY = 'auth_token'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }

  const setToken = (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
    // Token is set, user will be fetched on next render via useEffect
  }

  const login = (): void => {
    // Redirect to backend login endpoint (will be proxied)
    window.location.href = '/api/auth/login'
  }

  const logout = (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  // Note: User fetching should be done via tRPC in components that need it
  // This context just manages the token
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    getToken,
    setToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
