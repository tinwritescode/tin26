import { injectable } from 'inversify'
import { WorkOS } from '@workos-inc/node'
import type { IWorkOSService } from './interfaces.js'

if (!process.env.WORKOS_API_KEY) {
  throw new Error('WORKOS_API_KEY is not set')
}

@injectable()
export class WorkOSService implements IWorkOSService {
  private workos: WorkOS

  constructor() {
    // Initialize WorkOS with API key and optionally client ID for session management
    this.workos = new WorkOS(process.env.WORKOS_API_KEY, {
      clientId: process.env.WORKOS_CLIENT_ID,
    })
  }

  getAuthorizationUrl(redirectUri: string, clientId: string): string {
    return this.workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      redirectUri,
      clientId,
    })
  }

  async authenticateWithCode(
    code: string,
    clientId: string,
  ): Promise<{
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    sealedSession?: string | null
  }> {
    const cookiePassword = process.env.WORKOS_COOKIE_PASSWORD

    if (!cookiePassword) {
      console.warn(
        'WORKOS_COOKIE_PASSWORD is not set. Sealed session will not be created.',
      )
    }

    const authenticateResponse =
      await this.workos.userManagement.authenticateWithCode({
        code,
        clientId,
        ...(cookiePassword
          ? {
              session: {
                sealSession: true,
                cookiePassword,
              },
            }
          : {}),
      })

    const { user, sealedSession } = authenticateResponse

    console.log('WorkOS authenticateWithCode response:', {
      hasUser: !!user,
      hasSealedSession: !!sealedSession,
      cookiePasswordSet: !!cookiePassword,
    })

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      sealedSession: sealedSession || null,
    }
  }

  getLogoutUrl(redirectUri: string, _clientId: string): string {
    // For JWT-based flows, there's no WorkOS session to logout from
    // The JWT is already cleared client-side, so we just redirect back to the app
    // If you want to clear WorkOS cookies from their domain, you would need to
    // redirect to their logout endpoint, but that requires a valid session
    return redirectUri
  }

  async getLogoutUrlFromSession(
    sessionCookie: string | undefined,
    redirectUri: string,
  ): Promise<string | null> {
    // For JWT flows, there's no session cookie, so this will return null
    // The logout will fall back to using getLogoutUrl instead
    if (!sessionCookie) {
      return null
    }

    const cookiePassword = process.env.WORKOS_COOKIE_PASSWORD
    if (!cookiePassword) {
      return null
    }

    try {
      const session = this.workos.userManagement.loadSealedSession({
        sessionData: sessionCookie,
        cookiePassword,
      })

      const logoutUrl = await session.getLogoutUrl({
        returnTo: redirectUri,
      })

      return logoutUrl
    } catch (error) {
      console.error('Failed to load WorkOS session:', error)
      return null
    }
  }
}
