import type { User } from '../../types/auth.js'
import type {
  HabitTemplate,
  Habit,
  HabitCompletion,
  HabitType,
  Post,
  PostComment,
  User as PrismaUser,
  Album,
  Image,
} from '@prisma/client'

export type HabitTemplateWithHabits = HabitTemplate & {
  habits: Habit[]
}

export interface IUserRepository {
  findByWorkosId: (workosId: string) => Promise<User | null>
  findById: (id: string) => Promise<User | null>
  create: (data: {
    workosId: string
    email: string
    firstName?: string | null
    lastName?: string | null
  }) => Promise<User>
  update: (
    id: string,
    data: {
      email?: string
      firstName?: string | null
      lastName?: string | null
      avatar?: string | null
      coverPhoto?: string | null
      bio?: string | null
      location?: string | null
      work?: string | null
      education?: string | null
    },
  ) => Promise<User>
  updateAppliedTemplate: (
    userId: string,
    templateId: string | null,
  ) => Promise<User>
}

export interface IHabitTemplateRepository {
  findById: (id: string, userId: string) => Promise<HabitTemplate | null>
  findByUserId: (userId: string) => Promise<HabitTemplate[]>
  create: (data: { userId: string; name: string }) => Promise<HabitTemplate>
  update: (
    id: string,
    userId: string,
    data: { name?: string },
  ) => Promise<HabitTemplate>
  delete: (id: string, userId: string) => Promise<void>
  findWithHabits: (
    id: string,
    userId: string,
  ) => Promise<HabitTemplateWithHabits | null>
}

export interface IHabitRepository {
  findByTemplateId: (templateId: string, userId: string) => Promise<Habit[]>
  findById: (id: string, userId: string) => Promise<Habit | null>
  create: (
    data: {
      templateId: string
      icon: string
      name: string
      description?: string | null
      type?: HabitType
    },
    userId: string,
  ) => Promise<Habit>
  update: (
    id: string,
    userId: string,
    data: {
      icon?: string
      name?: string
      description?: string | null
      type?: HabitType
    },
  ) => Promise<Habit>
  delete: (id: string, userId: string) => Promise<void>
}

export interface IHabitCompletionRepository {
  findByHabitIdAndDate: (
    habitId: string,
    userId: string,
    date: string,
  ) => Promise<HabitCompletion | null>
  findByDateRange: (
    userId: string,
    startDate: string,
    endDate: string,
  ) => Promise<HabitCompletion[]>
  toggleCompletion: (data: {
    userId: string
    habitId: string
    date: string
  }) => Promise<HabitCompletion | null>
  decreaseCompletion: (data: {
    userId: string
    habitId: string
    date: string
  }) => Promise<HabitCompletion | null>
  getCompletedHabitIdsForDate: (
    userId: string,
    date: string,
  ) => Promise<string[]>
  getCompletionCountsForDate: (
    userId: string,
    date: string,
  ) => Promise<Map<string, number>>
  getStatisticsForUser: (
    userId: string,
    templateId: string,
    startDate?: string,
    endDate?: string,
  ) => Promise<{
    totalHabits: number
    totalCompletions: number
    totalDaysTracked: number
    overallCompletionRate: number
    currentStreak: number
    longestStreak: number
    averageCompletionsPerDay: number
    habits: Array<{
      habitId: string
      habitName: string
      habitIcon: string
      totalCompletions: number
      completionRate: number
      currentStreak: number
      longestStreak: number
      firstCompletionDate: string | null
      lastCompletionDate: string | null
    }>
  }>
  getWeeklyCompletions: (
    userId: string,
    templateId: string,
    weeks: number,
  ) => Promise<
    Array<{
      weekStart: string
      weekEnd: string
      totalCompletions: number
      completionRate: number
      habitsCompleted: Array<{
        habitId: string
        habitName: string
        daysCompleted: number
      }>
    }>
  >
  getMonthlyCompletions: (
    userId: string,
    templateId: string,
    months: number,
  ) => Promise<
    Array<{
      month: string
      monthName: string
      totalCompletions: number
      completionRate: number
      averageCompletionsPerDay: number
      bestDay: { date: string; completions: number } | null
    }>
  >
  calculateStreaks: (
    userId: string,
    templateId: string,
  ) => Promise<
    Array<{
      habitId: string
      habitName: string
      habitIcon: string
      currentStreak: number
      longestStreak: number
      streakStartDate: string | null
      lastCompletionDate: string | null
    }>
  >
  getCompletionCalendar: (
    userId: string,
    templateId: string,
    year: number,
    habitId?: string,
  ) => Promise<{
    year: number
    data: Array<{
      date: string
      completions: number
      habits: Array<{ habitId: string; habitName: string }>
    }>
  }>
}

export type PostWithAuthor = Post & {
  user: PrismaUser
  _count: {
    likes: number
    comments: number
    shares: number
  }
}

export type CommentWithAuthor = PostComment & {
  user: PrismaUser
}

export type LikeWithUser = {
  id: string
  userId: string
  createdAt: Date
  user: PrismaUser
}

export interface IPostRepository {
  findById: (id: string) => Promise<PostWithAuthor | null>
  findByUserId: (
    userId: string,
    limit?: number,
    offset?: number,
  ) => Promise<PostWithAuthor[]>
  findFeed: (
    userId: string,
    limit?: number,
    offset?: number,
  ) => Promise<PostWithAuthor[]>
  create: (data: {
    userId: string
    content: string
    imageUrl?: string | null
  }) => Promise<PostWithAuthor>
  update: (
    id: string,
    userId: string,
    data: {
      content?: string
      imageUrl?: string | null
    },
  ) => Promise<PostWithAuthor>
  delete: (id: string, userId: string) => Promise<void>
  toggleLike: (
    postId: string,
    userId: string,
  ) => Promise<{ liked: boolean; likeCount: number }>
  addComment: (
    postId: string,
    userId: string,
    content: string,
  ) => Promise<CommentWithAuthor>
  deleteComment: (commentId: string, userId: string) => Promise<void>
  share: (
    postId: string,
    userId: string,
  ) => Promise<{ shared: boolean; shareCount: number }>
  getLikeCount: (postId: string) => Promise<number>
  getCommentCount: (postId: string) => Promise<number>
  getShareCount: (postId: string) => Promise<number>
  isLikedByUser: (postId: string, userId: string) => Promise<boolean>
  isSharedByUser: (postId: string, userId: string) => Promise<boolean>
  getComments: (
    postId: string,
    limit?: number,
    offset?: number,
  ) => Promise<CommentWithAuthor[]>
  getLikedUsers: (
    postId: string,
    limit?: number,
  ) => Promise<LikeWithUser[]>
}

import type { Notification, NotificationType, PushSubscription } from '@prisma/client'

export interface INotificationRepository {
  create: (data: {
    userId: string
    type: NotificationType
    metadata: Record<string, unknown>
  }) => Promise<Notification>
  findByUserId: (
    userId: string,
    limit?: number,
    offset?: number,
  ) => Promise<Notification[]>
  markAsRead: (notificationId: string, userId: string) => Promise<Notification>
  markAllAsRead: (userId: string) => Promise<{ count: number }>
  getUnreadCount: (userId: string) => Promise<number>
  delete: (notificationId: string, userId: string) => Promise<void>
}

export interface IPushSubscriptionRepository {
  create: (data: {
    userId: string
    endpoint: string
    keys: { p256dh: string; auth: string }
  }) => Promise<PushSubscription>
  findByUserId: (userId: string) => Promise<PushSubscription[]>
  delete: (userId: string, endpoint: string) => Promise<void>
}

export type AlbumWithUser = Album & {
  user: PrismaUser
  _count: {
    images: number
  }
}

export type AlbumWithImages = Album & {
  user: PrismaUser
  images: Image[]
  _count: {
    images: number
  }
}

export interface IAlbumRepository {
  findById: (id: string) => Promise<AlbumWithUser | null>
  findByUserId: (
    userId: string,
    limit?: number,
    offset?: number,
  ) => Promise<AlbumWithUser[]>
  findByIdWithImages: (id: string) => Promise<AlbumWithImages | null>
  create: (data: {
    userId: string
    title: string
    description?: string | null
    thumbnailUrl?: string | null
  }) => Promise<AlbumWithUser>
  update: (
    id: string,
    userId: string,
    data: {
      title?: string
      description?: string | null
      thumbnailUrl?: string | null
    },
  ) => Promise<AlbumWithUser>
  delete: (id: string, userId: string) => Promise<void>
  verifyOwnership: (albumId: string, userId: string) => Promise<boolean>
}

export type ImageWithAlbum = Image & {
  album: Album
}

export interface IImageRepository {
  findById: (id: string) => Promise<ImageWithAlbum | null>
  findByAlbumId: (
    albumId: string,
    limit?: number,
    offset?: number,
  ) => Promise<Image[]>
  create: (data: {
    albumId: string
    url: string
    description?: string | null
    order?: number
  }) => Promise<Image>
  update: (
    id: string,
    userId: string, // For ownership verification via album
    data: {
      description?: string | null
      order?: number
    },
  ) => Promise<Image>
  delete: (id: string, userId: string) => Promise<void>
  verifyOwnership: (imageId: string, userId: string) => Promise<boolean>
}
