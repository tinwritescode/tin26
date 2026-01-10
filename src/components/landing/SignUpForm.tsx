import { useAuth } from '../../common/hooks/useAuth'

export function SignUpForm() {
  const { login } = useAuth()

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-[#050505] mb-4">
        Create an account
      </h2>
      <p className="text-sm text-[#65676B] mb-4">It's quick and easy.</p>

      <button
        onClick={login}
        className="w-full py-2 text-base font-semibold text-white bg-[#42B72A] rounded hover:bg-[#36A420] transition-colors duration-200 cursor-pointer"
      >
        Sign Up
      </button>
    </div>
  )
}
