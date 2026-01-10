import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from '../trpc.js'

// Validation schemas
const templateIdSchema = z.object({
  templateId: z.string().cuid(),
})

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
})

const updateTemplateSchema = z.object({
  templateId: z.string().cuid(),
  name: z.string().min(1).max(100),
})

const addHabitSchema = z.object({
  templateId: z.string().cuid(),
  icon: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

const updateHabitSchema = z.object({
  habitId: z.string().cuid(),
  icon: z.string().min(1).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
})

const deleteHabitSchema = z.object({
  habitId: z.string().cuid(),
})

const setActiveTemplateSchema = z.object({
  templateId: z.string().cuid().nullable(),
})

const toggleCompletionSchema = z.object({
  habitId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
        return await ctx.habitRepository.update(
          input.habitId,
          ctx.user.id,
          {
            icon: input.icon,
            name: input.name,
            description: input.description,
          },
        )
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
            error instanceof Error ? error.message : 'Failed to set active template',
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
})
