import { createUploadthing, type FileRouter } from 'uploadthing/express'
import type { Request } from 'express'
import { container } from '../container.js'
import { TYPES as ServiceTypes } from '../services/types.js'
import { TYPES as RepositoryTypes } from '../repositories/types.js'
import type { IJwtService } from '../services/interfaces.js'
import type { IUserRepository } from '../repositories/interfaces.js'

// Verify environment variable
if (!process.env.UPLOADTHING_TOKEN) {
  console.warn(
    'UPLOADTHING_TOKEN is not set. UploadThing may not work correctly.',
  )
}

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      try {
        // Authenticate the user using JWT
        const jwtService = container.get<IJwtService>(ServiceTypes.JwtService)
        const userRepository = container.get<IUserRepository>(
          RepositoryTypes.UserRepository,
        )

        const token = jwtService.extractTokenFromHeader(req as Request)
        if (!token) {
          console.error('UploadThing middleware: No token provided')
          throw new Error('Unauthorized: No token provided')
        }

        const payload = jwtService.verifyToken(token)
        const user = await userRepository.findById(payload.userId)
        if (!user) {
          console.error(
            'UploadThing middleware: User not found',
            payload.userId,
          )
          throw new Error('Unauthorized: User not found')
        }

        console.log('UploadThing middleware: User authenticated', user.id)
        return {
          userId: user.id,
        }
      } catch (error) {
        console.error('UploadThing middleware error:', error)
        throw error instanceof Error
          ? error
          : new Error('Unauthorized: Authentication failed')
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('File URL:', file.url)

      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
