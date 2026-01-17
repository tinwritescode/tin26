import { inject, injectable } from 'inversify'
import { TYPES } from './types.js'
import type { PrismaClient, Image } from '@prisma/client'
import type { IImageRepository, ImageWithAlbum } from './interfaces.js'

@injectable()
export class ImageRepository implements IImageRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  private async verifyAlbumOwnership(
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

  async findById(id: string): Promise<ImageWithAlbum | null> {
    const image = await this.prisma.image.findUnique({
      where: { id },
      include: {
        album: true,
      },
    })

    return image as ImageWithAlbum | null
  }

  async findByAlbumId(
    albumId: string,
    limit = 50,
    offset = 0,
  ): Promise<Image[]> {
    const images = await this.prisma.image.findMany({
      where: { albumId },
      orderBy: [
        {
          order: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
      take: limit,
      skip: offset,
    })

    return images
  }

  async create(data: {
    albumId: string
    url: string
    description?: string | null
    order?: number
  }): Promise<Image> {
    // If order not provided, get max order + 1
    let order = data.order
    if (order === undefined) {
      const maxOrderImage = await this.prisma.image.findFirst({
        where: { albumId: data.albumId },
        orderBy: { order: 'desc' },
      })
      order = maxOrderImage ? maxOrderImage.order + 1 : 0
    }

    const image = await this.prisma.image.create({
      data: {
        albumId: data.albumId,
        url: data.url,
        description: data.description ?? null,
        order,
      },
    })

    return image
  }

  async update(
    id: string,
    userId: string, // For ownership verification via album
    data: {
      description?: string | null
      order?: number
    },
  ): Promise<Image> {
    // First get the image to find its album
    const image = await this.prisma.image.findUnique({
      where: { id },
      include: {
        album: true,
      },
    })

    if (!image) {
      throw new Error('Image not found')
    }

    // Verify album ownership
    await this.verifyAlbumOwnership(image.albumId, userId)

    const updatedImage = await this.prisma.image.update({
      where: { id },
      data: {
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.order !== undefined && { order: data.order }),
      },
    })

    return updatedImage
  }

  async delete(id: string, userId: string): Promise<void> {
    // First get the image to find its album
    const image = await this.prisma.image.findUnique({
      where: { id },
      include: {
        album: true,
      },
    })

    if (!image) {
      throw new Error('Image not found')
    }

    // Verify album ownership
    await this.verifyAlbumOwnership(image.albumId, userId)

    await this.prisma.image.delete({
      where: { id },
    })
  }

  async verifyOwnership(imageId: string, userId: string): Promise<boolean> {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
      include: {
        album: true,
      },
    })

    if (!image) {
      return false
    }

    return image.album.userId === userId
  }
}
