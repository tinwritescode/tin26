import { container } from './container.js'
import { TYPES as ControllerTypes } from './controllers/types.js'
import type { Express } from 'express'
import type {
  IAuthController,
  IHealthController,
} from './controllers/interfaces.js'

export function registerRoutes(app: Express): void {
  const authController = container.get<IAuthController>(
    ControllerTypes.AuthController,
  )
  const healthController = container.get<IHealthController>(
    ControllerTypes.HealthController,
  )

  // Authentication API routes
  app.get('/api/auth/login', (req, res) => authController.login(req, res))
  app.get('/api/auth/callback', (req, res) => authController.callback(req, res))

  // Health check route
  app.get('/health', (req, res) => healthController.check(req, res))
}
