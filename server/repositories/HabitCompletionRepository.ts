import { inject, injectable } from 'inversify'
import { TYPES } from './types.js'
import type { PrismaClient, HabitCompletion } from '@prisma/client'
import { HabitType } from '@prisma/client'
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
    // Get habit to check its type
    const habit = await this.prisma.habit.findUnique({
      where: { id: data.habitId },
      select: { type: true },
    })

    if (!habit) {
      throw new Error('Habit not found')
    }

    // Check if completion exists
    const existing = await this.findByHabitIdAndDate(
      data.habitId,
      data.userId,
      data.date,
    )

    // For repeatable habits, increment count instead of toggling
    if (habit.type === HabitType.repeatable) {
      if (existing) {
        // Increment count
        return this.prisma.habitCompletion.update({
          where: {
            userId_habitId_date: {
              userId: data.userId,
              habitId: data.habitId,
              date: data.date,
            },
          },
          data: {
            count: { increment: 1 },
          },
        })
      } else {
        // Create with count = 1
        return this.prisma.habitCompletion.create({
          data: {
            userId: data.userId,
            habitId: data.habitId,
            date: data.date,
            count: 1,
          },
        })
      }
    } else {
      // For once_per_day habits, toggle behavior
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
            count: 1,
          },
        })
      }
    }
  }

  async decreaseCompletion(data: {
    userId: string
    habitId: string
    date: string
  }): Promise<HabitCompletion | null> {
    // Get habit to check its type
    const habit = await this.prisma.habit.findUnique({
      where: { id: data.habitId },
      select: { type: true },
    })

    if (!habit) {
      throw new Error('Habit not found')
    }

    // Only allow decrease for repeatable habits
    if (habit.type !== HabitType.repeatable) {
      throw new Error('Can only decrease count for repeatable habits')
    }

    // Check if completion exists
    const existing = await this.findByHabitIdAndDate(
      data.habitId,
      data.userId,
      data.date,
    )

    if (!existing || existing.count <= 0) {
      return null
    }

    // If count is 1, delete the completion
    if (existing.count === 1) {
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
    }

    // Decrement count
    return this.prisma.habitCompletion.update({
      where: {
        userId_habitId_date: {
          userId: data.userId,
          habitId: data.habitId,
          date: data.date,
        },
      },
      data: {
        count: { decrement: 1 },
      },
    })
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

  async getCompletionCountsForDate(
    userId: string,
    date: string,
  ): Promise<Map<string, number>> {
    const completions = await this.prisma.habitCompletion.findMany({
      where: {
        userId,
        date,
      },
      select: {
        habitId: true,
        count: true,
      },
    })

    const countsMap = new Map<string, number>()
    for (const completion of completions) {
      countsMap.set(completion.habitId, completion.count)
    }

    return countsMap
  }

  private calculateStreak(
    dates: string[],
    today: string,
  ): { current: number; longest: number } {
    if (dates.length === 0) return { current: 0, longest: 0 }

    const sortedDates = [...dates].sort((a, b) => b.localeCompare(a))
    const dateSet = new Set(sortedDates)

    // Calculate current streak
    let currentStreak = 0
    const todayDate = new Date(today)
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(todayDate)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      if (dateSet.has(dateStr)) {
        currentStreak++
      } else {
        break
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    let prevDate: Date | null = null

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr)
      if (prevDate === null) {
        tempStreak = 1
      } else {
        const diffDays =
          (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      prevDate = currentDate
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return { current: currentStreak, longest: longestStreak }
  }

  async getStatisticsForUser(
    userId: string,
    templateId: string,
    startDate?: string,
    endDate?: string,
  ) {
    // Get all habits for the template
    const habits = await this.prisma.habit.findMany({
      where: { templateId },
      select: { id: true, name: true, icon: true },
    })

    if (habits.length === 0) {
      return {
        totalHabits: 0,
        totalCompletions: 0,
        totalDaysTracked: 0,
        overallCompletionRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageCompletionsPerDay: 0,
        habits: [],
      }
    }

    const habitIds = habits.map((h) => h.id)
    const today = new Date().toISOString().split('T')[0]

    // Get all completions for these habits
    const whereClause: any = {
      userId,
      habitId: { in: habitIds },
    }

    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) whereClause.date.gte = startDate
      if (endDate) whereClause.date.lte = endDate
    }

    const allCompletions = await this.prisma.habitCompletion.findMany({
      where: whereClause,
      select: { habitId: true, date: true },
    })

    // Calculate overall stats
    const totalCompletions = allCompletions.length
    const uniqueDates = new Set(allCompletions.map((c) => c.date))
    const totalDaysTracked = uniqueDates.size

    // Calculate date range for completion rate
    const actualStartDate = startDate || (allCompletions.length > 0
      ? allCompletions.reduce((earliest, c) =>
          c.date < earliest ? c.date : earliest,
        allCompletions[0].date)
      : today)
    const actualEndDate = endDate || today
    const start = new Date(actualStartDate)
    const end = new Date(actualEndDate)
    const totalDaysInRange =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const possibleCompletions = habits.length * totalDaysInRange
    const overallCompletionRate =
      possibleCompletions > 0
        ? (totalCompletions / possibleCompletions) * 100
        : 0

    // Calculate overall streak (days with at least one completion)
    const allDates = Array.from(uniqueDates)
    const { current: currentStreak, longest: longestStreak } =
      this.calculateStreak(allDates, today)

    const averageCompletionsPerDay =
      totalDaysTracked > 0 ? totalCompletions / totalDaysTracked : 0

    // Calculate per-habit stats
    const habitStats = await Promise.all(
      habits.map(async (habit) => {
        const habitCompletions = allCompletions.filter(
          (c) => c.habitId === habit.id,
        )
        const habitDates = habitCompletions.map((c) => c.date)
        const { current: habitCurrentStreak, longest: habitLongestStreak } =
          this.calculateStreak(habitDates, today)

        const sortedDates = [...habitDates].sort()
        return {
          habitId: habit.id,
          habitName: habit.name,
          habitIcon: habit.icon,
          totalCompletions: habitCompletions.length,
          completionRate:
            totalDaysInRange > 0
              ? (habitCompletions.length / totalDaysInRange) * 100
              : 0,
          currentStreak: habitCurrentStreak,
          longestStreak: habitLongestStreak,
          firstCompletionDate:
            sortedDates.length > 0 ? sortedDates[0] : null,
          lastCompletionDate:
            sortedDates.length > 0
              ? sortedDates[sortedDates.length - 1]
              : null,
        }
      }),
    )

    return {
      totalHabits: habits.length,
      totalCompletions,
      totalDaysTracked,
      overallCompletionRate: Math.round(overallCompletionRate * 100) / 100,
      currentStreak,
      longestStreak,
      averageCompletionsPerDay: Math.round(averageCompletionsPerDay * 100) / 100,
      habits: habitStats,
    }
  }

  async getWeeklyCompletions(
    userId: string,
    templateId: string,
    weeks: number,
  ) {
    const habits = await this.prisma.habit.findMany({
      where: { templateId },
      select: { id: true, name: true },
    })

    if (habits.length === 0) return []

    const habitIds = habits.map((h) => h.id)
    const today = new Date()
    const weeksData: Array<{
      weekStart: string
      weekEnd: string
      totalCompletions: number
      completionRate: number
      habitsCompleted: Array<{
        habitId: string
        habitName: string
        daysCompleted: number
      }>
    }> = []

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - (i * 7 + today.getDay()))
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const weekStartStr = weekStart.toISOString().split('T')[0]
      const weekEndStr = weekEnd.toISOString().split('T')[0]

      const completions = await this.prisma.habitCompletion.findMany({
        where: {
          userId,
          habitId: { in: habitIds },
          date: { gte: weekStartStr, lte: weekEndStr },
        },
      })

      const totalCompletions = completions.length
      const possibleCompletions = habits.length * 7
      const completionRate =
        possibleCompletions > 0 ? (totalCompletions / possibleCompletions) * 100 : 0

      const habitCompletionsMap = new Map<string, Set<string>>()
      for (const completion of completions) {
        if (!habitCompletionsMap.has(completion.habitId)) {
          habitCompletionsMap.set(completion.habitId, new Set())
        }
        habitCompletionsMap.get(completion.habitId)!.add(completion.date)
      }

      const habitsCompleted = habits.map((habit) => ({
        habitId: habit.id,
        habitName: habit.name,
        daysCompleted:
          habitCompletionsMap.get(habit.id)?.size || 0,
      }))

      weeksData.push({
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        totalCompletions,
        completionRate: Math.round(completionRate * 100) / 100,
        habitsCompleted,
      })
    }

    return weeksData.reverse()
  }

  async getMonthlyCompletions(
    userId: string,
    templateId: string,
    months: number,
  ) {
    const habits = await this.prisma.habit.findMany({
      where: { templateId },
      select: { id: true },
    })

    if (habits.length === 0) return []

    const habitIds = habits.map((h) => h.id)
    const today = new Date()
    const monthsData: Array<{
      month: string
      monthName: string
      totalCompletions: number
      completionRate: number
      averageCompletionsPerDay: number
      bestDay: { date: string; completions: number } | null
    }> = []

    for (let i = 0; i < months; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
      )

      const monthStartStr = monthStart.toISOString().split('T')[0]
      const monthEndStr = monthEnd.toISOString().split('T')[0]
      const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
      const monthName = monthDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })

      const completions = await this.prisma.habitCompletion.findMany({
        where: {
          userId,
          habitId: { in: habitIds },
          date: { gte: monthStartStr, lte: monthEndStr },
        },
      })

      const totalCompletions = completions.length
      const daysInMonth = monthEnd.getDate()
      const possibleCompletions = habits.length * daysInMonth
      const completionRate =
        possibleCompletions > 0 ? (totalCompletions / possibleCompletions) * 100 : 0
      const averageCompletionsPerDay =
        daysInMonth > 0 ? totalCompletions / daysInMonth : 0

      // Find best day
      const dateCompletionsMap = new Map<string, number>()
      for (const completion of completions) {
        dateCompletionsMap.set(
          completion.date,
          (dateCompletionsMap.get(completion.date) || 0) + 1,
        )
      }

      let bestDay: { date: string; completions: number } | null = null
      for (const [date, count] of dateCompletionsMap.entries()) {
        if (!bestDay || count > bestDay.completions) {
          bestDay = { date, completions: count }
        }
      }

      monthsData.push({
        month: monthStr,
        monthName,
        totalCompletions,
        completionRate: Math.round(completionRate * 100) / 100,
        averageCompletionsPerDay: Math.round(averageCompletionsPerDay * 100) / 100,
        bestDay,
      })
    }

    return monthsData.reverse()
  }

  async calculateStreaks(userId: string, templateId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { templateId },
      select: { id: true, name: true, icon: true },
    })

    if (habits.length === 0) return []

    const habitIds = habits.map((h) => h.id)
    const today = new Date().toISOString().split('T')[0]

    const allCompletions = await this.prisma.habitCompletion.findMany({
      where: {
        userId,
        habitId: { in: habitIds },
      },
      select: { habitId: true, date: true },
    })

    return habits.map((habit) => {
      const habitCompletions = allCompletions
        .filter((c) => c.habitId === habit.id)
        .map((c) => c.date)
      const { current: currentStreak, longest: longestStreak } =
        this.calculateStreak(habitCompletions, today)

      const sortedDates = [...habitCompletions].sort()
      const lastCompletionDate =
        sortedDates.length > 0
          ? sortedDates[sortedDates.length - 1]
          : null

      // Find streak start date (if current streak exists)
      let streakStartDate: string | null = null
      if (currentStreak > 0) {
        const todayDate = new Date(today)
        const streakStart = new Date(todayDate)
        streakStart.setDate(todayDate.getDate() - (currentStreak - 1))
        streakStartDate = streakStart.toISOString().split('T')[0]
      }

      return {
        habitId: habit.id,
        habitName: habit.name,
        habitIcon: habit.icon,
        currentStreak,
        longestStreak,
        streakStartDate,
        lastCompletionDate,
      }
    })
  }

  async getCompletionCalendar(
    userId: string,
    templateId: string,
    year: number,
    habitId?: string,
  ) {
    const habits = await this.prisma.habit.findMany({
      where: { templateId },
      select: { id: true, name: true },
    })

    if (habits.length === 0) {
      return { year, data: [] }
    }

    const habitIds = habitId
      ? [habitId]
      : habits.map((h) => h.id)

    const yearStart = `${year}-01-01`
    const yearEnd = `${year}-12-31`

    const completions = await this.prisma.habitCompletion.findMany({
      where: {
        userId,
        habitId: { in: habitIds },
        date: { gte: yearStart, lte: yearEnd },
      },
      include: {
        habit: {
          select: { id: true, name: true },
        },
      },
    })

    // Group by date
    const dateMap = new Map<
      string,
      { completions: number; habits: Array<{ habitId: string; habitName: string }> }
    >()

    for (const completion of completions) {
      const date = completion.date
      if (!dateMap.has(date)) {
        dateMap.set(date, { completions: 0, habits: [] })
      }
      const entry = dateMap.get(date)!
      entry.completions++
      if (
        !entry.habits.some((h) => h.habitId === completion.habit.id)
      ) {
        entry.habits.push({
          habitId: completion.habit.id,
          habitName: completion.habit.name,
        })
      }
    }

    const data = Array.from(dateMap.entries()).map(([date, value]) => ({
      date,
      completions: value.completions,
      habits: value.habits,
    }))

    return { year, data }
  }
}
