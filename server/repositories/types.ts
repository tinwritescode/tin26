export const TYPES = {
  UserRepository: Symbol.for('UserRepository'),
  HabitTemplateRepository: Symbol.for('HabitTemplateRepository'),
  HabitRepository: Symbol.for('HabitRepository'),
  HabitCompletionRepository: Symbol.for('HabitCompletionRepository'),
  PostRepository: Symbol.for('PostRepository'),
  NotificationRepository: Symbol.for('NotificationRepository'),
  PushSubscriptionRepository: Symbol.for('PushSubscriptionRepository'),
  PrismaClient: Symbol.for('PrismaClient'),
} as const
