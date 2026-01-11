import { container } from './container.js'
import { TYPES as ControllerTypes } from './controllers/types.js'
import type { Express } from 'express'
import type {
  IAuthController,
  IHealthController,
} from './controllers/interfaces.js'
import { uploadthingRouter } from './uploadthing/route.js'

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
  app.get('/api/auth/logout', (req, res) => {
    authController.logout(req, res).catch((err) => {
      console.error('Logout error:', err)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      res.redirect(`${frontendUrl}/`)
    })
  })

  // UploadThing file upload routes
  app.use('/api/uploadthing', uploadthingRouter)

  // Health check route
  app.get('/health', (req, res) => healthController.check(req, res))
}
