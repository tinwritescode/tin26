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
    this.workos = new WorkOS(process.env.WORKOS_API_KEY)
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
  }> {
    const { user } = await this.workos.userManagement.authenticateWithCode({
      code,
      clientId,
    })
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
    }
  }
}
