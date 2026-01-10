import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './trpc/router/_app.js'
import { registerRoutes } from './routes.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
)

// Register routes
registerRoutes(app)

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: async (opts) => {
      const { createContext } = await import('./trpc/context.js')
      return createContext(opts)
    },
  }),
)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`)
})
