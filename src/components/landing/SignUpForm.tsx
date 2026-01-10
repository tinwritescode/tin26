import { useAuth } from '../../common/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function SignUpForm() {
  const { login } = useAuth()

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border p-6">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Create an account
      </h2>
      <p className="text-sm text-muted-foreground mb-4">It's quick and easy.</p>

      <Button
        onClick={login}
        className="w-full"
      >
        Sign Up
      </Button>
    </div>
  )
}
