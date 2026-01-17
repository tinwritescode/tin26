import { Heart, MessageCircle, Share2, Target, Trophy, X } from 'lucide-react'
import { formatRelativeTime } from '../../utils/time'
import type { Notification } from '../../types/notifications'
import { NotificationType } from '../../types/notifications'
import { cn } from '@/components/lib/utils'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  onClick?: () => void
}

const NOTIFICATION_ICONS = {
  [NotificationType.POST_LIKE]: Heart,
  [NotificationType.POST_COMMENT]: MessageCircle,
  [NotificationType.POST_SHARE]: Share2,
  [NotificationType.HABIT_REMINDER]: Target,
  [NotificationType.HABIT_ACHIEVEMENT]: Trophy,
} as const

const NOTIFICATION_MESSAGES = {
  [NotificationType.POST_LIKE]: 'liked your post',
  [NotificationType.POST_COMMENT]: 'commented on your post',
  [NotificationType.POST_SHARE]: 'shared your post',
  [NotificationType.HABIT_REMINDER]: 'Time to complete your habits!',
  [NotificationType.HABIT_ACHIEVEMENT]: 'Congratulations on your achievement!',
} as const

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const Icon = NOTIFICATION_ICONS[notification.type]
  const message = NOTIFICATION_MESSAGES[notification.type]

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    onClick?.()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(notification.id)
  }

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 px-4 py-3 transition-colors duration-200 cursor-pointer',
        'hover:bg-[#F0F2F5]',
        !notification.read && 'bg-blue-50/50',
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          'flex-shrink-0 rounded-full p-2 transition-colors duration-200',
          notification.type === NotificationType.POST_LIKE &&
            'bg-red-100 text-red-600',
          notification.type === NotificationType.POST_COMMENT &&
            'bg-blue-100 text-blue-600',
          notification.type === NotificationType.POST_SHARE &&
            'bg-green-100 text-green-600',
          notification.type === NotificationType.HABIT_REMINDER &&
            'bg-purple-100 text-purple-600',
          notification.type === NotificationType.HABIT_ACHIEVEMENT &&
            'bg-yellow-100 text-yellow-600',
        )}
      >
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#050505]">
          <span className="font-semibold">Someone</span> {message}
        </p>
        <p className="text-xs text-[#65676B] mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {!notification.read && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-[#1877F2] rounded-full flex-shrink-0" />
      )}

      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-full hover:bg-[#E4E6EB] transition-opacity duration-200 cursor-pointer"
        aria-label="Delete notification"
      >
        <X className="w-4 h-4 text-[#65676B]" />
      </button>
    </div>
  )
}
