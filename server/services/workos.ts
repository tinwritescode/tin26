import { WorkOS } from '@workos-inc/node'

if (!process.env.WORKOS_API_KEY) {
  throw new Error('WORKOS_API_KEY is not set')
}

if (!process.env.WORKOS_CLIENT_ID) {
  throw new Error('WORKOS_CLIENT_ID is not set')
}

export const workos = new WorkOS(process.env.WORKOS_API_KEY)

export const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID
export const getWorkOSRedirectUri = (): string => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  return process.env.WORKOS_REDIRECT_URI || `${frontendUrl}/api/auth/callback`
}
