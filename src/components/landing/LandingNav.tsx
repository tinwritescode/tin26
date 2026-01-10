import { useAuth } from '../../common/hooks/useAuth'

export function LandingNav() {
  const { login } = useAuth()

  return (
    <nav className="bg-white border-b border-[#CCD0D5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-[#1877F2] cursor-pointer">
              MyApp
            </div>
          </div>

          {/* Login Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={login}
              className="px-4 py-1.5 text-sm font-semibold text-white bg-[#1877F2] rounded hover:bg-[#166FE5] transition-colors duration-200 cursor-pointer"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
