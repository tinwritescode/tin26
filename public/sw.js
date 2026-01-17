// Service Worker for PWA
const CACHE_NAME = 'myapp-v1'
const urlsToCache = [
  '/',
  '/index.html',
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll with error handling - cache what we can
      return Promise.allSettled(
        urlsToCache.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`Failed to cache ${url}:`, err)
            // Don't fail the entire install if one URL fails
            return null
          }),
        ),
      )
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting()
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim()
    }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip non-HTTP(S) requests (e.g., chrome-extension://, file://, etc.)
  const url = new URL(event.request.url)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return
  }

  // Skip WebSocket upgrade requests and Vite HMR
  if (
    event.request.headers.get('upgrade') === 'websocket' ||
    event.request.url.includes('/__vite') ||
    event.request.url.includes('?token=')
  ) {
    return
  }

  // Skip API requests (they should always go to network)
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/trpc')
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200) {
            return response
          }

          // Only cache same-origin responses (basic) or CORS responses with valid status
          // Opaque responses (cross-origin without CORS) cannot be cached
          if (response.type === 'opaque') {
            return response
          }

          // Double-check URL scheme before caching (defensive)
          const requestUrl = new URL(event.request.url)
          if (requestUrl.protocol !== 'http:' && requestUrl.protocol !== 'https:') {
            return response
          }

          // Clone the response before caching
          const responseToCache = response.clone()

          // Cache in background (don't wait for it)
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          }).catch((err) => {
            console.warn('Failed to cache response:', err)
          })

          return response
        })
        .catch((error) => {
          // Network error - return cached version if available, or the error
          console.warn('Network request failed:', error)
          // Could return a fallback page here if desired
          throw error
        })
    }),
  )
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: {},
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || notificationData.data,
      }
    } catch (error) {
      console.error('Error parsing push notification data:', error)
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      tag: notificationData.data.notificationId || 'notification',
      requireInteraction: false,
    }),
  )
})

// Notification click event - handle when user clicks on a notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const notificationData = event.notification.data || {}
  const urlToOpen = notificationData.postId
    ? `/?postId=${notificationData.postId}`
    : '/'

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // If a window is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then(() => {
              if ('navigate' in client && urlToOpen) {
                return client.navigate(urlToOpen)
              }
            })
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})
