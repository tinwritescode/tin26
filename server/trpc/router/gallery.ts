import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from '../trpc.js'

// Validation schemas
const albumIdSchema = z.object({
  albumId: z.string().min(1),
})

const getAlbumsSchema = z
  .object({
    userId: z.string().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
  })
  .nullish()

const createAlbumSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  thumbnailUrl: z
    .union([z.string().url(), z.literal(''), z.null(), z.undefined()])
    .optional()
    .nullable()
    .transform((val) => (val === '' || val === undefined ? null : val)),
})

const updateAlbumSchema = z.object({
  albumId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  thumbnailUrl: z
    .union([z.string().url(), z.literal(''), z.null(), z.undefined()])
    .optional()
    .nullable()
    .transform((val) => (val === '' || val === undefined ? null : val)),
})

const deleteAlbumSchema = z.object({
  albumId: z.string().min(1),
})

const getAlbumImagesSchema = z.object({
  albumId: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
})

const addImageSchema = z.object({
  albumId: z.string().min(1),
  url: z.string().url(),
  description: z.string().max(500).optional().nullable(),
})

const updateImageSchema = z.object({
  imageId: z.string().min(1),
  description: z.string().max(500).optional().nullable(),
})

const deleteImageSchema = z.object({
  imageId: z.string().min(1),
})

export const galleryRouter = router({
  getAlbums: protectedProcedure
    .input(getAlbumsSchema)
    .query(async ({ ctx, input }) => {
      const params = input || {}
      const userId = params.userId || ctx.user.id
      const limit = params.limit ?? 20
      const offset = params.offset ?? 0
      return ctx.albumRepository.findByUserId(userId, limit, offset)
    }),

  getAlbum: protectedProcedure
    .input(albumIdSchema)
    .query(async ({ ctx, input }) => {
      const album = await ctx.albumRepository.findByIdWithImages(input.albumId)

      if (!album) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Album not found',
        })
      }

      return album
    }),

  createAlbum: protectedProcedure
    .input(createAlbumSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.albumRepository.create({
        userId: ctx.user.id,
        title: input.title,
        description: input.description ?? null,
        thumbnailUrl: input.thumbnailUrl || null,
      })
    }),

  updateAlbum: protectedProcedure
    .input(updateAlbumSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.albumRepository.update(
          input.albumId,
          ctx.user.id,
          {
            title: input.title,
            description: input.description,
            thumbnailUrl: input.thumbnailUrl,
          },
        )
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : 'Album not found or access denied',
        })
      }
    }),

  deleteAlbum: protectedProcedure
    .input(deleteAlbumSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.albumRepository.delete(input.albumId, ctx.user.id)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : 'Album not found or access denied',
        })
      }
    }),

  getAlbumImages: protectedProcedure
    .input(getAlbumImagesSchema)
    .query(async ({ ctx, input }) => {
      return ctx.imageRepository.findByAlbumId(
        input.albumId,
        input.limit,
        input.offset,
      )
    }),

  addImage: protectedProcedure
    .input(addImageSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify album ownership
      const isOwner = await ctx.albumRepository.verifyOwnership(
        input.albumId,
        ctx.user.id,
      )

      if (!isOwner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Album not found or access denied',
        })
      }

      return ctx.imageRepository.create({
        albumId: input.albumId,
        url: input.url,
        description: input.description ?? null,
      })
    }),

  updateImage: protectedProcedure
    .input(updateImageSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.imageRepository.update(input.imageId, ctx.user.id, {
          description: input.description,
        })
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : 'Image not found or access denied',
        })
      }
    }),

  deleteImage: protectedProcedure
    .input(deleteImageSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.imageRepository.delete(input.imageId, ctx.user.id)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : 'Image not found or access denied',
        })
      }
    }),
})
