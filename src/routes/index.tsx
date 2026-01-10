import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../lib/auth'
import { trpc } from '../lib/trpc'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { login, logout, getToken } = useAuth()
  const hasToken = !!getToken()

  const { data: user, isLoading } = trpc.auth.getCurrentUser.useQuery(
    undefined,
    {
      enabled: hasToken,
      retry: false,
    },
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">My App</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <span className="text-gray-500">Loading...</span>
              ) : user ? (
                <>
                  <span className="text-gray-700">
                    {user.firstName} {user.lastName} ({user.email})
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={login}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
            {user ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome, {user.firstName || user.email}!
                </h2>
                <p className="text-gray-600">
                  You are successfully authenticated with WorkOS.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to the App
                </h2>
                <p className="text-gray-600 mb-4">Please log in to continue.</p>
                <button
                  onClick={login}
                  className="px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Sign in with WorkOS
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
