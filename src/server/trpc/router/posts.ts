import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from '../trpc.js'

// Validation schemas
const postIdSchema = z.object({
  postId: z.string().min(1),
})

const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  imageUrl: z
    .union([z.string().url(), z.literal(''), z.null(), z.undefined()])
    .optional()
    .nullable()
    .transform((val) => (val === '' || val === undefined ? null : val)),
})

const updatePostSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1).max(5000).optional(),
  imageUrl: z
    .union([z.string().url(), z.literal(''), z.null(), z.undefined()])
    .optional()
    .nullable()
    .transform((val) => (val === '' || val === undefined ? null : val)),
})

const deletePostSchema = z.object({
  postId: z.string().min(1),
})

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional(),
})

const getUserPostsSchema = z.object({
  userId: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional(),
})

const addCommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1).max(1000),
})

const deleteCommentSchema = z.object({
  commentId: z.string().min(1),
})

export const postsRouter = router({
  getFeed: protectedProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      return ctx.postRepository.findFeed(
        ctx.user.id,
        input.limit,
        input.offset,
      )
    }),

  getUserPosts: protectedProcedure
    .input(getUserPostsSchema)
    .query(async ({ ctx, input }) => {
      return ctx.postRepository.findByUserId(
        input.userId,
        input.limit,
        input.offset,
      )
    }),

  getPost: protectedProcedure
    .input(postIdSchema)
    .query(async ({ ctx, input }) => {
      const post = await ctx.postRepository.findById(input.postId)

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        })
      }

      return post
    }),

  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.postRepository.create({
        userId: ctx.user.id,
        content: input.content,
        imageUrl: input.imageUrl || null,
      })
    }),

  updatePost: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.postRepository.update(
          input.postId,
          ctx.user.id,
          {
            content: input.content,
            imageUrl: input.imageUrl !== undefined ? (input.imageUrl || null) : undefined,
          },
        )
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : 'Post not found or access denied',
        })
      }
    }),

  deletePost: protectedProcedure
    .input(deletePostSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.postRepository.delete(input.postId, ctx.user.id)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : 'Post not found or access denied',
        })
      }
    }),

  toggleLike: protectedProcedure
    .input(postIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.postRepository.toggleLike(input.postId, ctx.user.id)
    }),

  addComment: protectedProcedure
    .input(addCommentSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.postRepository.addComment(
        input.postId,
        ctx.user.id,
        input.content,
      )
    }),

  deleteComment: protectedProcedure
    .input(deleteCommentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.postRepository.deleteComment(input.commentId, ctx.user.id)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : 'Comment not found or access denied',
        })
      }
    }),

  sharePost: protectedProcedure
    .input(postIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.postRepository.share(input.postId, ctx.user.id)
    }),

  getPostInteractions: protectedProcedure
    .input(postIdSchema)
    .query(async ({ ctx, input }) => {
      const [liked, shared, likeCount, commentCount, shareCount] =
        await Promise.all([
          ctx.postRepository.isLikedByUser(input.postId, ctx.user.id),
          ctx.postRepository.isSharedByUser(input.postId, ctx.user.id),
          ctx.postRepository.getLikeCount(input.postId),
          ctx.postRepository.getCommentCount(input.postId),
          ctx.postRepository.getShareCount(input.postId),
        ])

      return {
        liked,
        shared,
        likeCount,
        commentCount,
        shareCount,
      }
    }),
})
