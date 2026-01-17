import type { PushSubscriptionKeys } from '../types/notifications'

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied'
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission()
  }

  return Notification.permission
}

export async function subscribeToPushNotifications(
  subscribePush: (subscription: {
    endpoint: string
    keys: PushSubscriptionKeys
  }) => void,
): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported')
    return
  }

  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    console.warn('Notification permission not granted')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // Get VAPID public key from environment or fetch from server
    const vapidPublicKey = await getVapidPublicKey()

    if (!vapidPublicKey) {
      console.warn('VAPID public key not available')
      return
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })

    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
    }

    subscribePush(subscriptionData)
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
  }
}

export async function unsubscribeFromPushNotifications(
  unsubscribePush: (endpoint: string) => void,
): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      unsubscribePush(subscription.endpoint)
    }
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
  }
}

async function getVapidPublicKey(): Promise<string | null> {
  // Try to get from environment variable first (for development)
  if (import.meta.env.VITE_VAPID_PUBLIC_KEY) {
    return import.meta.env.VITE_VAPID_PUBLIC_KEY
  }

  // Otherwise, fetch from server
  try {
    const response = await fetch('/api/vapid-public-key')
    if (response.ok) {
      const data = await response.json()
      return data.publicKey
    }
  } catch (error) {
    console.error('Error fetching VAPID public key:', error)
  }

  return null
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}
