import type { RouterOutput } from '../lib/trpc'

export type Post = RouterOutput<'posts'>['getFeed'][number]

export type PostWithInteractions = Post & {
  liked: boolean
  shared: boolean
}
