import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../common/hooks/useAuth'
import { LandingNav } from '../components/landing/LandingNav'

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
    <div className="min-h-screen bg-[#F0F2F5]">
      <LandingNav />
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#050505] mb-2 text-center">
              Sign in to your account
            </h2>
            <p className="text-sm text-[#65676B] text-center mb-6">
              Use your WorkOS credentials to continue
            </p>
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
                <div className="text-sm text-red-800">
                  {error === 'no_code' &&
                    'Authentication failed: No authorization code received.'}
                  {error === 'authentication_failed' &&
                    'Authentication failed. Please try again.'}
                  {error === 'database_error' &&
                    'Database connection error. Please check if the database is running.'}
                  {![
                    'no_code',
                    'authentication_failed',
                    'database_error',
                  ].includes(error) &&
                    'An error occurred during authentication.'}
                </div>
              </div>
            )}
            <button
              onClick={login}
              className="w-full py-2.5 px-4 text-base font-semibold text-white bg-[#1877F2] rounded hover:bg-[#166FE5] transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
            >
              Sign in with WorkOS
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
