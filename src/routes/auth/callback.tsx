import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../common/hooks/useAuth'

export const Route = createFileRoute('/auth/callback')({
  component: Callback,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || undefined,
      code: (search.code as string) || undefined,
      error: (search.error as string) || undefined,
    }
  },
})

function Callback() {
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const { token, code, error } = Route.useSearch()

  useEffect(() => {
    // If code is present, redirect to backend API endpoint
    // This handles cases where WorkOS redirects to /auth/callback instead of /api/auth/callback
    if (code) {
      window.location.href = `/api/auth/callback?code=${code}`
      return
    }

    if (error) {
      navigate({ to: '/login', search: { error } })
      return
    }

    if (token) {
      setToken(token)
      navigate({ to: '/' })
    } else {
      navigate({ to: '/login', search: { error: 'no_token' } })
    }
  }, [token, code, error, setToken, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="inline-block h-8 w-8 animate-spin text-indigo-600" />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
