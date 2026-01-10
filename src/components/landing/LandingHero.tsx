import { useAuth } from '../../common/hooks/useAuth'
import { SignUpForm } from './SignUpForm'

export function LandingHero() {
  const { login } = useAuth()

  return (
    <div className="bg-[#F0F2F5] min-h-[calc(100vh-56px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold text-[#050505] mb-4 leading-tight">
              Connect with friends and the world around you
            </h1>
            <p className="text-lg text-[#65676B] mb-8">
              MyApp helps you connect and share with the people in your life.
            </p>
          </div>

          {/* Right Side - Sign Up Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <SignUpForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
