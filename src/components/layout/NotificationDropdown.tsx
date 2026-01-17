import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverPopup } from '@/components/ui/popover'
import { NotificationItem } from './NotificationItem'
import { useNotifications } from '../../common/hooks/useNotifications'
import { useNavigate } from '@tanstack/react-router'
import type { Notification } from '../../types/notifications'
import { NotificationType } from '../../types/notifications'

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const {
    notifications,
    notificationsLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  const handleNotificationClick = (notification: Notification) => {
    if (notification.metadata.postId) {
      navigate({ to: '/', search: { postId: notification.metadata.postId } })
      setOpen(false)
    }
  }

  // Convert Prisma notification to app notification type
  const convertNotification = (notification: {
    id: string
    userId: string
    type: string
    read: boolean
    readAt: string | Date | null
    metadata: unknown
    createdAt: string | Date
  }): Notification => {
    const readAtStr =
      notification.readAt instanceof Date
        ? notification.readAt.toISOString()
        : notification.readAt ?? null
    const createdAtStr =
      notification.createdAt instanceof Date
        ? notification.createdAt.toISOString()
        : String(notification.createdAt)

    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type as NotificationType,
      read: notification.read,
      readAt: readAtStr,
      metadata:
        typeof notification.metadata === 'object' &&
        notification.metadata !== null &&
        !Array.isArray(notification.metadata)
          ? (notification.metadata as Record<string, unknown>)
          : {},
      createdAt: createdAtStr,
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="relative p-2 rounded-full hover:bg-[#F0F2F5] transition-colors duration-200 cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6 text-[#050505]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#F02849] text-white text-xs font-semibold rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverPopup
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-[360px] max-w-[calc(100vw-2rem)] max-h-[500px] p-0"
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#CCD0D5]">
            <h3 className="text-lg font-semibold text-[#050505]">
              Notifications
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-sm text-[#1877F2] hover:text-[#166FE5] transition-colors duration-200 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[400px]">
            {notificationsLoading ? (
              <div className="px-4 py-8 text-center text-[#65676B] text-sm">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Bell className="w-12 h-12 text-[#CCD0D5] mx-auto mb-3" />
                <p className="text-[#65676B] text-sm font-medium mb-1">
                  No notifications yet
                </p>
                <p className="text-[#8A8D91] text-xs">
                  When you get notifications, they'll show up here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E4E6EB]">
                {((notifications as unknown) as Array<{
                  id: string
                  userId: string
                  type: string
                  read: boolean
                  readAt: string | Date | null
                  metadata: unknown
                  createdAt: string | Date
                }>).map((notification) => {
                  const convertedNotification = convertNotification(notification)
                  return (
                    <NotificationItem
                      key={convertedNotification.id}
                      notification={convertedNotification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                      onClick={() => handleNotificationClick(convertedNotification)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  )
}
