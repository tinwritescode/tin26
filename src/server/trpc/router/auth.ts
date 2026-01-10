import { protectedProcedure, router } from '../trpc.js'

export const authRouter = router({
  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),

  logout: protectedProcedure.mutation(() => {
    // Token invalidation would be handled client-side by removing the token
    // If you need server-side token blacklisting, implement it here
    return { success: true }
  }),
})
