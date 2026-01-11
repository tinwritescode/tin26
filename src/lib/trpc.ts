import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '../../server/trpc/router/_app.js'

export const trpc = createTRPCReact<AppRouter>()

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function createTrpcClient() {
  // Always use relative URL - automatically uses current frontend URL (window.location.origin)
  // This is the standard practice for proxied setups (nginx, Vite dev server)
  // Relative URLs work everywhere: dev (Vite proxy), production (nginx proxy), Railway
  // Only use absolute URL if explicitly set for separate deployments without proxy
  const trpcUrl =
    typeof window !== 'undefined'
      ? '/trpc' // Browser: relative URL uses current origin automatically
      : import.meta.env.VITE_API_URL &&
          import.meta.env.VITE_API_URL.trim() !== ''
        ? `${import.meta.env.VITE_API_URL}/trpc` // SSR: use explicit backend URL
        : import.meta.env.VITE_TRPC_URL || '/trpc' // Fallback

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
