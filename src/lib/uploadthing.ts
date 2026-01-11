import { generateReactHelpers } from '@uploadthing/react'
import type { OurFileRouter } from '../../server/uploadthing/router.js'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>({
    url: '/api/uploadthing',
    fetch: (url, options) => {
      const token = getAuthToken()
      const headers = new Headers(options?.headers)
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return fetch(url, {
        ...options,
        headers,
      })
    },
  })
