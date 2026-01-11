import { createRouteHandler } from 'uploadthing/express'
import { ourFileRouter } from './router.js'

export const uploadthingRouter = createRouteHandler({
  router: ourFileRouter,
})
