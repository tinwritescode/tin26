import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from '../trpc.js'

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional(),
})

const markAsReadSchema = z.object({
  notificationId: z.string().min(1),
})

const deleteNotificationSchema = z.object({
  notificationId: z.string().min(1),
})

const subscribePushSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

export const notificationsRouter = router({
  getNotifications: protectedProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      return ctx.notificationRepository.findByUserId(
        ctx.user.id,
        input.limit,
        input.offset,
      )
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return ctx.notificationRepository.getUnreadCount(ctx.user.id)
  }),

  markAsRead: protectedProcedure
    .input(markAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.notificationRepository.markAsRead(
          input.notificationId,
          ctx.user.id,
        )
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification not found or access denied',
        })
      }
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.notificationRepository.markAllAsRead(ctx.user.id)
  }),

  deleteNotification: protectedProcedure
    .input(deleteNotificationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.notificationRepository.delete(
          input.notificationId,
          ctx.user.id,
        )
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification not found or access denied',
        })
      }
    }),

  subscribePush: protectedProcedure
    .input(subscribePushSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.pushSubscriptionRepository.create({
        userId: ctx.user.id,
        endpoint: input.endpoint,
        keys: input.keys,
      })
    }),

  unsubscribePush: protectedProcedure
    .input(z.object({ endpoint: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.pushSubscriptionRepository.delete(ctx.user.id, input.endpoint)
      return { success: true }
    }),
})
