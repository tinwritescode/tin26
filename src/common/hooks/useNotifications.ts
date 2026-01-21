import { useCallback, useEffect, useState } from 'react'
import { trpc } from '../../lib/trpc'

export function useNotifications() {
  const utils = trpc.useUtils()
  const [isWindowVisible, setIsWindowVisible] = useState(
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true,
  )

  // Track window visibility to only poll when active
  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleVisibilityChange = () => {
      setIsWindowVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Fetch notifications with polling (every 30 seconds when window is active)
  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = trpc.notifications.getNotifications.useQuery(
    { limit: 20, offset: 0 },
    {
      refetchInterval: isWindowVisible ? 30000 : false, // Poll every 30 seconds only when window is active
      refetchOnWindowFocus: true,
    },
  )

  // Fetch unread count with polling (every 30 seconds when window is active)
  const {
    data: unreadCount = 0,
    isLoading: unreadCountLoading,
    refetch: refetchUnreadCount,
  } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: isWindowVisible ? 30000 : false, // Poll every 30 seconds only when window is active
    refetchOnWindowFocus: true,
  })

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getNotifications.invalidate()
      utils.notifications.getUnreadCount.invalidate()
    },
  })

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getNotifications.invalidate()
      utils.notifications.getUnreadCount.invalidate()
    },
  })

  const deleteNotification = trpc.notifications.deleteNotification.useMutation({
    onSuccess: () => {
      utils.notifications.getNotifications.invalidate()
      utils.notifications.getUnreadCount.invalidate()
    },
  })

  const subscribePushMutation = trpc.notifications.subscribePush.useMutation()
  const unsubscribePush = trpc.notifications.unsubscribePush.useMutation()

  return {
    notifications,
    notificationsLoading,
    unreadCount,
    unreadCountLoading,
    markAsRead: (notificationId: string) =>
      markAsRead.mutate({ notificationId }),
    markAllAsRead: () => markAllAsRead.mutate(),
    deleteNotification: (notificationId: string) =>
      deleteNotification.mutate({ notificationId }),
    subscribePush: useCallback(
      (subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) =>
        subscribePushMutation.mutate(subscription),
      [subscribePushMutation],
    ),
    unsubscribePush: (endpoint: string) =>
      unsubscribePush.mutate({ endpoint }),
    refetchNotifications,
    refetchUnreadCount,
  }
}
