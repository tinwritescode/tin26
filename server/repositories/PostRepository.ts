import { inject, injectable } from 'inversify'
import { TYPES } from './types.js'
import type { PrismaClient } from '@prisma/client'
import type {
  IPostRepository,
  PostWithAuthor,
  CommentWithAuthor,
} from './interfaces.js'

@injectable()
export class PostRepository implements IPostRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  private async verifyOwnership(
    postId: string,
    userId: string,
  ): Promise<void> {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        userId,
      },
    })

    if (!post) {
      throw new Error('Post not found or access denied')
    }
  }

  async findById(id: string): Promise<PostWithAuthor | null> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
    })

    return post as PostWithAuthor | null
  }

  async findByUserId(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<PostWithAuthor[]> {
    const posts = await this.prisma.post.findMany({
      where: { userId },
      include: {
        user: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    return posts as PostWithAuthor[]
  }

  async findFeed(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<PostWithAuthor[]> {
    // For now, return all posts. Can be enhanced later with following/friends logic
    const posts = await this.prisma.post.findMany({
      include: {
        user: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    return posts as PostWithAuthor[]
  }

  async create(data: {
    userId: string
    content: string
    imageUrl?: string | null
  }): Promise<PostWithAuthor> {
    const post = await this.prisma.post.create({
      data: {
        userId: data.userId,
        content: data.content,
        imageUrl: data.imageUrl || null,
      },
      include: {
        user: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
    })

    return post as PostWithAuthor
  }

  async update(
    id: string,
    userId: string,
    data: {
      content?: string
      imageUrl?: string | null
    },
  ): Promise<PostWithAuthor> {
    await this.verifyOwnership(id, userId)

    const post = await this.prisma.post.update({
      where: { id },
      data: {
        ...(data.content !== undefined && { content: data.content }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      },
      include: {
        user: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
    })

    return post as PostWithAuthor
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.verifyOwnership(id, userId)

    await this.prisma.post.delete({
      where: { id },
    })
  }

  async toggleLike(
    postId: string,
    userId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    })

    if (existingLike) {
      await this.prisma.postLike.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      })
    } else {
      await this.prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      })
    }

    const likeCount = await this.getLikeCount(postId)

    return {
      liked: !existingLike,
      likeCount,
    }
  }

  async addComment(
    postId: string,
    userId: string,
    content: string,
  ): Promise<CommentWithAuthor> {
    const comment = await this.prisma.postComment.create({
      data: {
        postId,
        userId,
        content,
      },
      include: {
        user: true,
      },
    })

    return comment as CommentWithAuthor
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    })

    if (!comment || comment.userId !== userId) {
      throw new Error('Comment not found or access denied')
    }

    await this.prisma.postComment.delete({
      where: { id: commentId },
    })
  }

  async share(
    postId: string,
    userId: string,
  ): Promise<{ shared: boolean; shareCount: number }> {
    const existingShare = await this.prisma.postShare.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    })

    if (existingShare) {
      await this.prisma.postShare.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      })
    } else {
      await this.prisma.postShare.create({
        data: {
          postId,
          userId,
        },
      })
    }

    const shareCount = await this.getShareCount(postId)

    return {
      shared: !existingShare,
      shareCount,
    }
  }

  async getLikeCount(postId: string): Promise<number> {
    return this.prisma.postLike.count({
      where: { postId },
    })
  }

  async getCommentCount(postId: string): Promise<number> {
    return this.prisma.postComment.count({
      where: { postId },
    })
  }

  async getShareCount(postId: string): Promise<number> {
    return this.prisma.postShare.count({
      where: { postId },
    })
  }

  async isLikedByUser(postId: string, userId: string): Promise<boolean> {
    const like = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    })

    return !!like
  }

  async isSharedByUser(postId: string, userId: string): Promise<boolean> {
    const share = await this.prisma.postShare.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    })

    return !!share
  }
}
