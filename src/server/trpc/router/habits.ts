import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { HabitType } from '@prisma/client'
import { protectedProcedure, router } from '../trpc.js'

// Validation schemas
const templateIdSchema = z.object({
  templateId: z.string().min(1),
})

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
})

const updateTemplateSchema = z.object({
  templateId: z.string().min(1),
  name: z.string().min(1).max(100),
})

const addHabitSchema = z.object({
  templateId: z.string().min(1),
  icon: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.nativeEnum(HabitType).default(HabitType.once_per_day),
})

const updateHabitSchema = z.object({
  habitId: z.string().min(1),
  icon: z.string().min(1).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.nativeEnum(HabitType).optional(),
})

const deleteHabitSchema = z.object({
  habitId: z.string().min(1),
})

const setActiveTemplateSchema = z.object({
  templateId: z.string().min(1).nullable(),
})

const toggleCompletionSchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const dateRangeSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

const weeksSchema = z.object({
  weeks: z.number().int().min(1).max(52).default(8),
})

const monthsSchema = z.object({
  months: z.number().int().min(1).max(24).default(6),
})

const calendarSchema = z.object({
  year: z.number().int().min(2020).max(2100).default(new Date().getFullYear()),
  habitId: z.string().min(1).optional(),
})

export const habitsRouter = router({
  // Template Management
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.habitTemplateRepository.findByUserId(ctx.user.id)
  }),

  getTemplate: protectedProcedure
    .input(templateIdSchema)
    .query(async ({ ctx, input }) => {
      const template = await ctx.habitTemplateRepository.findWithHabits(
        input.templateId,
        ctx.user.id,
      )

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found or access denied',
        })
      }

      return template
    }),

  createTemplate: protectedProcedure
    .input(createTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.habitTemplateRepository.create({
        userId: ctx.user.id,
        name: input.name,
      })
    }),

  updateTemplate: protectedProcedure
    .input(updateTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.habitTemplateRepository.update(
          input.templateId,
          ctx.user.id,
          { name: input.name },
        )
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found or access denied',
        })
      }
    }),

  deleteTemplate: protectedProcedure
    .input(templateIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.habitTemplateRepository.delete(input.templateId, ctx.user.id)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found or access denied',
        })
      }
    }),

  // Habit Management
  addHabitToTemplate: protectedProcedure
    .input(addHabitSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.habitRepository.create(
          {
            templateId: input.templateId,
            icon: input.icon,
            name: input.name,
            description: input.description,
            type: input.type,
          },
          ctx.user.id,
        )
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to add habit to template',
        })
      }
    }),

  updateHabit: protectedProcedure
    .input(updateHabitSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.habitRepository.update(input.habitId, ctx.user.id, {
          icon: input.icon,
          name: input.name,
          description: input.description,
          type: input.type,
        })
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Habit not found or access denied',
        })
      }
    }),

  deleteHabit: protectedProcedure
    .input(deleteHabitSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.habitRepository.delete(input.habitId, ctx.user.id)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Habit not found or access denied',
        })
      }
    }),

  // Active Template
  getActiveTemplate: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.appliedTemplateId) {
      return null
    }

    const template = await ctx.habitTemplateRepository.findWithHabits(
      ctx.user.appliedTemplateId,
      ctx.user.id,
    )

    return template
  }),

  setActiveTemplate: protectedProcedure
    .input(setActiveTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.userRepository.updateAppliedTemplate(
          ctx.user.id,
          input.templateId,
        )

        if (input.templateId) {
          return await ctx.habitTemplateRepository.findWithHabits(
            input.templateId,
            ctx.user.id,
          )
        }

        return null
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to set active template',
        })
      }
    }),

  // Completion Tracking
  getTodaysCompletions: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    return ctx.habitCompletionRepository.getCompletedHabitIdsForDate(
      ctx.user.id,
      today,
    )
  }),

  getTodaysCompletionCounts: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const countsMap =
      await ctx.habitCompletionRepository.getCompletionCountsForDate(
        ctx.user.id,
        today,
      )
    // Convert Map to object for JSON serialization
    return Object.fromEntries(countsMap)
  }),

  toggleHabitCompletion: protectedProcedure
    .input(toggleCompletionSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify habit ownership through template
      const habit = await ctx.habitRepository.findById(
        input.habitId,
        ctx.user.id,
      )

      if (!habit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Habit not found or access denied',
        })
      }

      const completion = await ctx.habitCompletionRepository.toggleCompletion({
        userId: ctx.user.id,
        habitId: input.habitId,
        date: input.date,
      })

      return {
        completed: completion !== null,
        completion,
      }
    }),

  decreaseHabitCompletion: protectedProcedure
    .input(toggleCompletionSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify habit ownership through template
      const habit = await ctx.habitRepository.findById(
        input.habitId,
        ctx.user.id,
      )

      if (!habit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Habit not found or access denied',
        })
      }

      const completion = await ctx.habitCompletionRepository.decreaseCompletion(
        {
          userId: ctx.user.id,
          habitId: input.habitId,
          date: input.date,
        },
      )

      return {
        completed: completion !== null,
        completion,
      }
    }),

  // Statistics
  getHabitStatistics: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.user.appliedTemplateId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No active template',
        })
      }

      return ctx.habitCompletionRepository.getStatisticsForUser(
        ctx.user.id,
        ctx.user.appliedTemplateId,
        input.startDate,
        input.endDate,
      )
    }),

  getWeeklyStats: protectedProcedure
    .input(weeksSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.user.appliedTemplateId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No active template',
        })
      }

      return ctx.habitCompletionRepository.getWeeklyCompletions(
        ctx.user.id,
        ctx.user.appliedTemplateId,
        input.weeks,
      )
    }),

  getMonthlyStats: protectedProcedure
    .input(monthsSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.user.appliedTemplateId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No active template',
        })
      }

      return ctx.habitCompletionRepository.getMonthlyCompletions(
        ctx.user.id,
        ctx.user.appliedTemplateId,
        input.months,
      )
    }),

  getHabitStreaks: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.appliedTemplateId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No active template',
      })
    }

    return ctx.habitCompletionRepository.calculateStreaks(
      ctx.user.id,
      ctx.user.appliedTemplateId,
    )
  }),

  getCompletionCalendar: protectedProcedure
    .input(calendarSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.user.appliedTemplateId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No active template',
        })
      }

      return ctx.habitCompletionRepository.getCompletionCalendar(
        ctx.user.id,
        ctx.user.appliedTemplateId,
        input.year,
        input.habitId,
      )
    }),
})
