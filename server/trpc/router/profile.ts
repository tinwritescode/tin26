import { z } from 'zod'
import { protectedProcedure, router } from '../trpc.js'

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional().nullable(),
  lastName: z.string().min(1).max(100).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  coverPhoto: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  work: z.string().max(200).optional().nullable(),
  education: z.string().max(200).optional().nullable(),
})

export const profileRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.userRepository.findById(ctx.user.id)
  }),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.userRepository.update(ctx.user.id, input)
    }),
})
