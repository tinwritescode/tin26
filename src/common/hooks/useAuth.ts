import { useSnapshot } from 'valtio'
import type { AuthContextType } from '../../types/auth.js'
import { authStore, login, logout, getToken, setToken } from '../../lib/auth.js'
import { trpc } from '../../lib/trpc.js'

export function useAuth(): AuthContextType {
  const snapshot = useSnapshot(authStore)
  return {
    isLoading: snapshot.isLoading,
    login,
    logout,
    getToken,
    setToken,
  }
}

export function useCurrentUser() {
  const { getToken } = useAuth()
  const hasToken = !!getToken()

  return trpc.auth.getCurrentUser.useQuery(undefined, {
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
