import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../lib/auth'

export const Route = createFileRoute('/login')({
  component: Login,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      error: (search.error as string) || undefined,
    }
  },
})

function Login() {
  const { login } = useAuth()
  const { error } = Route.useSearch()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">
              {error === 'no_code' &&
                'Authentication failed: No authorization code received.'}
              {error === 'authentication_failed' &&
                'Authentication failed. Please try again.'}
              {error === 'database_error' &&
                'Database connection error. Please check if the database is running.'}
              {!['no_code', 'authentication_failed', 'database_error'].includes(
                error,
              ) && 'An error occurred during authentication.'}
            </div>
          </div>
        )}
        <div>
          <button
            onClick={login}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in with WorkOS
          </button>
        </div>
      </div>
    </div>
  )
}
