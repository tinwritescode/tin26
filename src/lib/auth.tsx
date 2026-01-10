import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { proxy, subscribe } from 'valtio'

const TOKEN_KEY = 'auth_token'

export const authStore = proxy({
  isLoading: true,
  accessToken: null as string | null,
})

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return authStore.accessToken
}

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return
  authStore.accessToken = token
  localStorage.setItem(TOKEN_KEY, token)
  // Token is set, user will be fetched on next render
}

export const login = (): void => {
  // Redirect to backend login endpoint (will be proxied)
  window.location.href = '/api/auth/login'
}

export const logout = (): void => {
  if (typeof window === 'undefined') return
  authStore.accessToken = null
  localStorage.removeItem(TOKEN_KEY)
  // Redirect to server logout endpoint which will handle WorkOS logout
  window.location.href = '/api/auth/logout'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // This provider just manages the token initialization
  useEffect(() => {
    // Initialize accessToken from localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      authStore.accessToken = storedToken
    }
    authStore.isLoading = false
  }, [])

  // Persist accessToken changes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const unsubscribe = subscribe(authStore, () => {
      const token = authStore.accessToken
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }
    })

    return unsubscribe
  }, [])

  return <>{children}</>
}
