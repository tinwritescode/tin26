import { router } from '../trpc.js'
import { exampleRouter } from './example.js'
import { authRouter } from './auth.js'
import { habitsRouter } from './habits.js'
import { profileRouter } from './profile.js'
import { postsRouter } from './posts.js'
import { notificationsRouter } from './notifications.js'
import { galleryRouter } from './gallery.js'

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  habits: habitsRouter,
  profile: profileRouter,
  posts: postsRouter,
  notifications: notificationsRouter,
  gallery: galleryRouter,
})

export type AppRouter = typeof appRouter
