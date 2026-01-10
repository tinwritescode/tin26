import { router } from '../trpc.js'
import { exampleRouter } from './example.js'
import { authRouter } from './auth.js'

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter
