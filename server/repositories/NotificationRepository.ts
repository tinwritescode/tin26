import { inject, injectable } from 'inversify'
import { TYPES } from './types.js'
import type { PrismaClient, Notification, NotificationType } from '@prisma/client'
import type { INotificationRepository } from './interfaces.js'

@injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async create(data: {
    userId: string
    type: NotificationType
    metadata: Record<string, unknown>
  }): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        metadata: data.metadata as any,
      },
    })
  }

  async findByUserId(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: {
        id: notificationId,
        userId, // Ensure user owns the notification
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    })
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.delete({
      where: {
        id: notificationId,
        userId, // Ensure user owns the notification
      },
    })
  }
}
