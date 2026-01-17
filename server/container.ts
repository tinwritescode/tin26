import 'reflect-metadata'
import { Container } from 'inversify'
import { TYPES as ServiceTypes } from './services/types.js'
import { TYPES as RepositoryTypes } from './repositories/types.js'
import { TYPES as ControllerTypes } from './controllers/types.js'
import { WorkOSService } from './services/WorkOSService.js'
import { JwtService } from './services/JwtService.js'
import { UserRepository } from './repositories/UserRepository.js'
import { HabitTemplateRepository } from './repositories/HabitTemplateRepository.js'
import { HabitRepository } from './repositories/HabitRepository.js'
import { HabitCompletionRepository } from './repositories/HabitCompletionRepository.js'
import { PostRepository } from './repositories/PostRepository.js'
import { NotificationRepository } from './repositories/NotificationRepository.js'
import { PushSubscriptionRepository } from './repositories/PushSubscriptionRepository.js'
import { AlbumRepository } from './repositories/AlbumRepository.js'
import { ImageRepository } from './repositories/ImageRepository.js'
import { NotificationService } from './services/NotificationService.js'
import { AuthController } from './controllers/AuthController.js'
import { HealthController } from './controllers/HealthController.js'
import { prisma } from './db/prisma.js'
import type { PrismaClient } from '@prisma/client'

const container = new Container()

// Bind PrismaClient instance
container
  .bind<PrismaClient>(RepositoryTypes.PrismaClient)
  .toConstantValue(prisma)

// Bind services as singletons
container
  .bind<WorkOSService>(ServiceTypes.WorkOSService)
  .to(WorkOSService)
  .inSingletonScope()
container
  .bind<JwtService>(ServiceTypes.JwtService)
  .to(JwtService)
  .inSingletonScope()

// Bind repositories as singletons
container
  .bind<UserRepository>(RepositoryTypes.UserRepository)
  .to(UserRepository)
  .inSingletonScope()
container
  .bind<HabitTemplateRepository>(RepositoryTypes.HabitTemplateRepository)
  .to(HabitTemplateRepository)
  .inSingletonScope()
container
  .bind<HabitRepository>(RepositoryTypes.HabitRepository)
  .to(HabitRepository)
  .inSingletonScope()
container
  .bind<HabitCompletionRepository>(RepositoryTypes.HabitCompletionRepository)
  .to(HabitCompletionRepository)
  .inSingletonScope()
container
  .bind<PostRepository>(RepositoryTypes.PostRepository)
  .to(PostRepository)
  .inSingletonScope()
container
  .bind<NotificationRepository>(RepositoryTypes.NotificationRepository)
  .to(NotificationRepository)
  .inSingletonScope()
container
  .bind<PushSubscriptionRepository>(
    RepositoryTypes.PushSubscriptionRepository,
  )
  .to(PushSubscriptionRepository)
  .inSingletonScope()
container
  .bind<AlbumRepository>(RepositoryTypes.AlbumRepository)
  .to(AlbumRepository)
  .inSingletonScope()
container
  .bind<ImageRepository>(RepositoryTypes.ImageRepository)
  .to(ImageRepository)
  .inSingletonScope()

// Bind services as singletons
container
  .bind<NotificationService>(ServiceTypes.NotificationService)
  .to(NotificationService)
  .inSingletonScope()

// Bind controllers as singletons
container
  .bind<AuthController>(ControllerTypes.AuthController)
  .to(AuthController)
  .inSingletonScope()
container
  .bind<HealthController>(ControllerTypes.HealthController)
  .to(HealthController)
  .inSingletonScope()

export { container }
