import type { User } from '../../types/auth.js'
import type {
  HabitTemplate,
  Habit,
  HabitCompletion,
  Prisma,
} from '@prisma/client'

export type HabitTemplateWithHabits = HabitTemplate & {
  habits: Habit[]
}

export interface IUserRepository {
  findByWorkosId: (workosId: string) => Promise<User | null>
  findById: (id: string) => Promise<User | null>
  create: (data: {
    workosId: string
    email: string
    firstName?: string | null
    lastName?: string | null
  }) => Promise<User>
  update: (
    id: string,
    data: {
      email?: string
      firstName?: string | null
      lastName?: string | null
    },
  ) => Promise<User>
  updateAppliedTemplate: (
    userId: string,
    templateId: string | null,
  ) => Promise<User>
}

export interface IHabitTemplateRepository {
  findById: (
    id: string,
    userId: string,
  ) => Promise<HabitTemplate | null>
  findByUserId: (userId: string) => Promise<HabitTemplate[]>
  create: (data: { userId: string; name: string }) => Promise<HabitTemplate>
  update: (
    id: string,
    userId: string,
    data: { name?: string },
  ) => Promise<HabitTemplate>
  delete: (id: string, userId: string) => Promise<void>
  findWithHabits: (
    id: string,
    userId: string,
  ) => Promise<HabitTemplateWithHabits | null>
}

export interface IHabitRepository {
  findByTemplateId: (templateId: string, userId: string) => Promise<Habit[]>
  findById: (id: string, userId: string) => Promise<Habit | null>
  create: (
    data: {
      templateId: string
      icon: string
      name: string
      description?: string | null
    },
    userId: string,
  ) => Promise<Habit>
  update: (
    id: string,
    userId: string,
    data: {
      icon?: string
      name?: string
      description?: string | null
    },
  ) => Promise<Habit>
  delete: (id: string, userId: string) => Promise<void>
}

export interface IHabitCompletionRepository {
  findByHabitIdAndDate: (
    habitId: string,
    userId: string,
    date: string,
  ) => Promise<HabitCompletion | null>
  findByDateRange: (
    userId: string,
    startDate: string,
    endDate: string,
  ) => Promise<HabitCompletion[]>
  toggleCompletion: (data: {
    userId: string
    habitId: string
    date: string
  }) => Promise<HabitCompletion | null>
  getCompletedHabitIdsForDate: (
    userId: string,
    date: string,
  ) => Promise<string[]>
}
