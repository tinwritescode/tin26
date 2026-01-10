export const TYPES = {
  UserRepository: Symbol.for('UserRepository'),
  HabitTemplateRepository: Symbol.for('HabitTemplateRepository'),
  HabitRepository: Symbol.for('HabitRepository'),
  HabitCompletionRepository: Symbol.for('HabitCompletionRepository'),
  PrismaClient: Symbol.for('PrismaClient'),
} as const
