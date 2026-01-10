import { z } from 'zod'
import { publicProcedure, router } from '../trpc.js'

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text ?? 'world'}`,
      }
    }),
})
