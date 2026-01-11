import type { Request, Response } from 'express'

export interface IAuthController {
  login: (req: Request, res: Response) => void
  callback: (req: Request, res: Response) => Promise<void>
  logout: (req: Request, res: Response) => Promise<void>
}

export interface IHealthController {
  check: (req: Request, res: Response) => void
}
