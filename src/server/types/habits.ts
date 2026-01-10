import type {
  HabitTemplate,
  Habit,
  HabitCompletion,
} from '@prisma/client'
import type { HabitTemplateWithHabits } from '../repositories/interfaces.js'

// Re-export types for convenience
export type { HabitTemplate, Habit, HabitCompletion, HabitTemplateWithHabits }

// Additional types for tRPC procedures
export type HabitTemplateOutput = HabitTemplate
export type HabitOutput = Habit
export type HabitCompletionOutput = HabitCompletion
