import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '../server/trpc/router/_app.js'

export const trpc = createTRPCReact<AppRouter>()

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function createTrpcClient() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  const trpcUrl = import.meta.env.VITE_TRPC_URL || `${apiUrl}/trpc`

  return trpc.createClient({
    links: [
      httpBatchLink({
        url: trpcUrl,
        headers: () => {
          const token = getAuthToken()
          return token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}
        },
      }),
    ],
  })
}

export const trpcClient = createTrpcClient()

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
