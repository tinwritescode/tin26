import { router } from '../trpc.js'
import { exampleRouter } from './example.js'
import { authRouter } from './auth.js'
import { habitsRouter } from './habits.js'

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  habits: habitsRouter,
})

export type AppRouter = typeof appRouter
