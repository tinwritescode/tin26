import { inject, injectable } from 'inversify'
import { TYPES } from './types.js'
import type { PrismaClient, HabitCompletion } from '@prisma/client'
import type { IHabitCompletionRepository } from './interfaces.js'

@injectable()
export class HabitCompletionRepository
  implements IHabitCompletionRepository
{
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findByHabitIdAndDate(
    habitId: string,
    userId: string,
    date: string,
  ): Promise<HabitCompletion | null> {
    return this.prisma.habitCompletion.findUnique({
      where: {
        userId_habitId_date: {
          userId,
          habitId,
          date,
        },
      },
    })
  }

  async findByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<HabitCompletion[]> {
    return this.prisma.habitCompletion.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })
  }

  async toggleCompletion(data: {
    userId: string
    habitId: string
    date: string
  }): Promise<HabitCompletion | null> {
    // Check if completion exists
    const existing = await this.findByHabitIdAndDate(
      data.habitId,
      data.userId,
      data.date,
    )

    if (existing) {
      // Delete if exists (toggle off)
      await this.prisma.habitCompletion.delete({
        where: {
          userId_habitId_date: {
            userId: data.userId,
            habitId: data.habitId,
            date: data.date,
          },
        },
      })
      return null
    } else {
      // Create if doesn't exist (toggle on)
      return this.prisma.habitCompletion.create({
        data: {
          userId: data.userId,
          habitId: data.habitId,
          date: data.date,
        },
      })
    }
  }

  async getCompletedHabitIdsForDate(
    userId: string,
    date: string,
  ): Promise<string[]> {
    const completions = await this.prisma.habitCompletion.findMany({
      where: {
        userId,
        date,
      },
      select: {
        habitId: true,
      },
    })

    return completions.map((c) => c.habitId)
  }
}
