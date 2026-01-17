import { inject, injectable } from 'inversify'
import { TYPES } from './types.js'
import type { PrismaClient } from '@prisma/client'
import type {
  IAlbumRepository,
  AlbumWithUser,
  AlbumWithImages,
} from './interfaces.js'

@injectable()
export class AlbumRepository implements IAlbumRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  private async verifyOwnershipAndThrow(
    albumId: string,
    userId: string,
  ): Promise<void> {
    const album = await this.prisma.album.findFirst({
      where: {
        id: albumId,
        userId,
      },
    })

    if (!album) {
      throw new Error('Album not found or access denied')
    }
  }

  async findById(id: string): Promise<AlbumWithUser | null> {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        user: true,
        _count: {
          select: {
            images: true,
          },
        },
      },
    })

    return album as AlbumWithUser | null
  }

  async findByUserId(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<AlbumWithUser[]> {
    const albums = await this.prisma.album.findMany({
      where: { userId },
      include: {
        user: true,
        _count: {
          select: {
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    return albums as AlbumWithUser[]
  }

  async findByIdWithImages(id: string): Promise<AlbumWithImages | null> {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        user: true,
        images: {
          orderBy: [
            {
              order: 'asc',
            },
            {
              createdAt: 'asc',
            },
          ],
        },
        _count: {
          select: {
            images: true,
          },
        },
      },
    })

    return album as AlbumWithImages | null
  }

  async create(data: {
    userId: string
    title: string
    description?: string | null
    thumbnailUrl?: string | null
  }): Promise<AlbumWithUser> {
    const album = await this.prisma.album.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description ?? null,
        thumbnailUrl: data.thumbnailUrl ?? null,
      },
      include: {
        user: true,
        _count: {
          select: {
            images: true,
          },
        },
      },
    })

    return album as AlbumWithUser
  }

  async update(
    id: string,
    userId: string,
    data: {
      title?: string
      description?: string | null
      thumbnailUrl?: string | null
    },
  ): Promise<AlbumWithUser> {
    await this.verifyOwnershipAndThrow(id, userId)

    const album = await this.prisma.album.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.thumbnailUrl !== undefined && {
          thumbnailUrl: data.thumbnailUrl,
        }),
      },
      include: {
        user: true,
        _count: {
          select: {
            images: true,
          },
        },
      },
    })

    return album as AlbumWithUser
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.verifyOwnershipAndThrow(id, userId)

    await this.prisma.album.delete({
      where: { id },
    })
  }

  async verifyOwnership(albumId: string, userId: string): Promise<boolean> {
    const album = await this.prisma.album.findFirst({
      where: {
        id: albumId,
        userId,
      },
    })

    return !!album
  }
}
