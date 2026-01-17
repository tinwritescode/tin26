export enum NotificationType {
  POST_LIKE = 'POST_LIKE',
  POST_COMMENT = 'POST_COMMENT',
  POST_SHARE = 'POST_SHARE',
  HABIT_REMINDER = 'HABIT_REMINDER',
  HABIT_ACHIEVEMENT = 'HABIT_ACHIEVEMENT',
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  read: boolean
  readAt: string | null
  metadata: {
    postId?: string
    commentId?: string
    actorId?: string
    [key: string]: unknown
  }
  createdAt: string
}

export interface PushSubscriptionKeys {
  p256dh: string
  auth: string
}

export interface PushSubscription {
  endpoint: string
  keys: PushSubscriptionKeys
}
