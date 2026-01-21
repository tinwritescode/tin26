import { memo, useEffect } from 'react'
import { useAuth } from '../../common/hooks/useAuth'
import { useNotifications } from '../../common/hooks/useNotifications'
import { subscribeToPushNotifications } from '../../lib/pushNotifications'

const PushNotificationInitializer = () => {
  const { getToken } = useAuth()
  const { subscribePush } = useNotifications()
  const hasToken = !!getToken()

  useEffect(() => {
    if (!hasToken) {
      return
    }

    // Only subscribe in production and if service worker is supported
    if (
      import.meta.env.PROD &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    ) {
      // Small delay to ensure service worker is ready
      const timeoutId = setTimeout(() => {
        subscribeToPushNotifications(subscribePush).catch((error) => {
          console.error('Failed to subscribe to push notifications:', error)
        })
      }, 2000)

      return () => clearTimeout(timeoutId)
    }
  }, [hasToken, subscribePush])

  return null
}

export default memo(PushNotificationInitializer)
