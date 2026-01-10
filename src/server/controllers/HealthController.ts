import { injectable } from 'inversify'
import type { Request, Response } from 'express'
import type { IHealthController } from './interfaces.js'

@injectable()
export class HealthController implements IHealthController {
  check(_req: Request, res: Response): void {
    res.json({ status: 'ok' })
  }
}
