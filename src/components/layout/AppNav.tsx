import { Bell, Home, Search } from 'lucide-react'
import { useAuth } from '../../common/hooks/useAuth'
import { trpc } from '../../lib/trpc'
import type { User } from '../../types/auth'

export function AppNav() {
  const { logout, getToken } = useAuth()
  const hasToken = !!getToken()

  const { data: userData } = trpc.auth.getCurrentUser.useQuery(undefined, {
    enabled: hasToken,
    retry: false,
  })

  // Transform dates from strings to Date objects
  const user: User | null = userData
    ? {
        ...userData,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt),
      }
    : null

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  return (
    <nav className="bg-white border-b border-[#CCD0D5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo and Search */}
          <div className="flex items-center gap-2 flex-1">
            <div className="text-2xl font-bold text-[#1877F2] cursor-pointer">
              MyApp
            </div>
            <div className="hidden md:flex items-center bg-[#F0F2F5] rounded-full px-4 py-2 flex-1 max-w-md ml-4">
              <Search className="w-4 h-4 text-[#65676B] mr-2" />
              <input
                type="text"
                placeholder="Search MyApp"
                className="bg-transparent border-0 outline-0 text-sm text-[#050505] placeholder-[#65676B] flex-1"
              />
            </div>
          </div>

          {/* Center: Navigation Icons (Mobile) */}
          <div className="flex items-center gap-1 md:hidden">
            <button className="p-2 rounded-full hover:bg-[#F0F2F5] transition-colors duration-200 cursor-pointer">
              <Home className="w-6 h-6 text-[#1877F2]" />
            </button>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-[#F0F2F5] transition-colors duration-200 cursor-pointer relative">
              <Bell className="w-6 h-6 text-[#050505]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F02849] rounded-full"></span>
            </button>
            {user && (
              <div className="flex items-center gap-2 ml-2">
                <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity duration-200">
                  {getInitials(user)}
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-sm font-medium text-[#050505] hover:bg-[#F0F2F5] rounded transition-colors duration-200 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
