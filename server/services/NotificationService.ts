import { inject, injectable } from 'inversify'
import webpush from 'web-push'
import { TYPES } from './types.js'
import { TYPES as RepositoryTypes } from '../repositories/types.js'
import type { INotificationRepository } from '../repositories/interfaces.js'
import type { IPushSubscriptionRepository } from '../repositories/interfaces.js'
import type { NotificationType, Notification } from '@prisma/client'
import type { INotificationService } from './interfaces.js'

// Initialize web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(RepositoryTypes.NotificationRepository)
    private notificationRepository: INotificationRepository,
    @inject(RepositoryTypes.PushSubscriptionRepository)
    private pushSubscriptionRepository: IPushSubscriptionRepository,
  ) {}

  async createNotification(data: {
    userId: string
    type: NotificationType
    metadata: Record<string, unknown>
    sendPush?: boolean
  }): Promise<Notification> {
    const notification = await this.notificationRepository.create({
      userId: data.userId,
      type: data.type,
      metadata: data.metadata,
    })

    // Send push notification if requested and VAPID keys are configured
    if (data.sendPush && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      try {
        await this.sendPushNotification(data.userId, notification)
      } catch (error) {
        // Log error but don't fail notification creation
        console.error('Failed to send push notification:', error)
      }
    }

    return notification
  }

  async sendPushNotification(
    userId: string,
    notification: Notification,
  ): Promise<void> {
    const subscriptions = await this.pushSubscriptionRepository.findByUserId(
      userId,
    )

    if (subscriptions.length === 0) {
      return
    }

    const payload = JSON.stringify({
      title: this.getNotificationTitle(notification.type),
      body: this.getNotificationBody(notification.type, notification.metadata),
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: {
        notificationId: notification.id,
        type: notification.type,
        ...notification.metadata,
      },
    })

    const sendPromises = subscriptions.map((subscription) => {
      try {
        return webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys as { p256dh: string; auth: string },
          },
          payload,
        )
      } catch (error) {
        console.error('Failed to send push to subscription:', error)
        // If subscription is invalid, delete it
        if (error instanceof Error && error.message.includes('410')) {
          this.pushSubscriptionRepository
            .delete(userId, subscription.endpoint)
            .catch(console.error)
        }
        return Promise.resolve()
      }
    })

    await Promise.allSettled(sendPromises)
  }

  async notifyPostLike(
    postOwnerId: string,
    actorId: string,
    postId: string,
  ): Promise<Notification | null> {
    // Don't notify if user likes their own post
    if (postOwnerId === actorId) {
      return null
    }

    return this.createNotification({
      userId: postOwnerId,
      type: 'POST_LIKE',
      metadata: {
        postId,
        actorId,
      },
      sendPush: true,
    })
  }

  async notifyPostComment(
    postOwnerId: string,
    actorId: string,
    postId: string,
    commentId: string,
  ): Promise<Notification | null> {
    // Don't notify if user comments on their own post
    if (postOwnerId === actorId) {
      return null
    }

    return this.createNotification({
      userId: postOwnerId,
      type: 'POST_COMMENT',
      metadata: {
        postId,
        commentId,
        actorId,
      },
      sendPush: true,
    })
  }

  async notifyPostShare(
    postOwnerId: string,
    actorId: string,
    postId: string,
  ): Promise<Notification | null> {
    // Don't notify if user shares their own post
    if (postOwnerId === actorId) {
      return null
    }

    return this.createNotification({
      userId: postOwnerId,
      type: 'POST_SHARE',
      metadata: {
        postId,
        actorId,
      },
      sendPush: true,
    })
  }

  private getNotificationTitle(type: NotificationType): string {
    switch (type) {
      case 'POST_LIKE':
        return 'New Like'
      case 'POST_COMMENT':
        return 'New Comment'
      case 'POST_SHARE':
        return 'Post Shared'
      case 'HABIT_REMINDER':
        return 'Habit Reminder'
      case 'HABIT_ACHIEVEMENT':
        return 'Habit Achievement'
      default:
        return 'New Notification'
    }
  }

  private getNotificationBody(
    type: NotificationType,
    metadata: Record<string, unknown>,
  ): string {
    switch (type) {
      case 'POST_LIKE':
        return 'Someone liked your post'
      case 'POST_COMMENT':
        return 'Someone commented on your post'
      case 'POST_SHARE':
        return 'Someone shared your post'
      case 'HABIT_REMINDER':
        return 'Time to complete your habits!'
      case 'HABIT_ACHIEVEMENT':
        return 'Congratulations on your achievement!'
      default:
        return 'You have a new notification'
    }
  }
}
