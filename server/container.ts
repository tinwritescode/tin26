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
