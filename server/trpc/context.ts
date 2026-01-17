import { container } from '../container.js'
import { TYPES as ServiceTypes } from '../services/types.js'
import { TYPES as RepositoryTypes } from '../repositories/types.js'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import type { IJwtService } from '../services/interfaces.js'
import type {
  IUserRepository,
  IHabitTemplateRepository,
  IHabitRepository,
  IHabitCompletionRepository,
  IPostRepository,
  INotificationRepository,
  IPushSubscriptionRepository,
  IAlbumRepository,
  IImageRepository,
} from '../repositories/interfaces.js'
import type { INotificationService } from '../services/interfaces.js'
import type { User } from '../../types/auth.js'

export async function createContext(opts?: CreateExpressContextOptions) {
  // Resolve services and repositories from container
  const jwtService = container.get<IJwtService>(ServiceTypes.JwtService)
  const userRepository = container.get<IUserRepository>(
    RepositoryTypes.UserRepository,
  )
  const habitTemplateRepository = container.get<IHabitTemplateRepository>(
    RepositoryTypes.HabitTemplateRepository,
  )
  const habitRepository = container.get<IHabitRepository>(
    RepositoryTypes.HabitRepository,
  )
  const habitCompletionRepository = container.get<IHabitCompletionRepository>(
    RepositoryTypes.HabitCompletionRepository,
  )
  const postRepository = container.get<IPostRepository>(
    RepositoryTypes.PostRepository,
  )
  const notificationRepository = container.get<INotificationRepository>(
    RepositoryTypes.NotificationRepository,
  )
  const pushSubscriptionRepository = container.get<IPushSubscriptionRepository>(
    RepositoryTypes.PushSubscriptionRepository,
  )
  const albumRepository = container.get<IAlbumRepository>(
    RepositoryTypes.AlbumRepository,
  )
  const imageRepository = container.get<IImageRepository>(
    RepositoryTypes.ImageRepository,
  )
  const notificationService = container.get<INotificationService>(
    ServiceTypes.NotificationService,
  )

  let user: User | null = null
  let isAuthenticated = false

  if (opts?.req) {
    const token = jwtService.extractTokenFromHeader(opts.req)
    if (token) {
      try {
        const payload = jwtService.verifyToken(token)
        const dbUser = await userRepository.findById(payload.userId)
        if (dbUser) {
          user = dbUser
          isAuthenticated = true
        }
      } catch (error) {
        // Token is invalid or expired, user remains null
      }
    }
  }

  return {
    jwtService,
    userRepository,
    habitTemplateRepository,
    habitRepository,
    habitCompletionRepository,
    postRepository,
    notificationRepository,
    pushSubscriptionRepository,
    albumRepository,
    imageRepository,
    notificationService,
    user,
    isAuthenticated,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
