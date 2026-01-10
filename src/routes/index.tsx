import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../common/hooks/useAuth'
import { trpc } from '../lib/trpc'
import type { User } from '../types/auth'
import { LandingNav } from '../components/landing/LandingNav'
import { LandingHero } from '../components/landing/LandingHero'
import { AppNav } from '../components/layout/AppNav'
import { Sidebar } from '../components/layout/Sidebar'
import { RightSidebar } from '../components/layout/RightSidebar'
import { CreatePost } from '../components/feed/CreatePost'
import { PostCard } from '../components/feed/PostCard'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { getToken } = useAuth()
  const hasToken = !!getToken()

  const { data: userData, isLoading } = trpc.auth.getCurrentUser.useQuery(
    undefined,
    {
      enabled: hasToken,
      retry: false,
    },
  )

  // Transform dates from strings to Date objects
  const user = userData
    ? {
        ...userData,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt),
      }
    : null

  // Landing page for non-logged-in users
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <LandingNav />
        <LandingHero />
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-[#65676B]">Loading...</div>
      </div>
    )
  }

  // Logged-in layout
  if (user) {
    return <FeedPage user={user} />
  }

  return null
}

function FeedPage({ user }: { user: User }) {
  const {
    data: posts,
    isLoading,
    error,
  } = trpc.posts.getFeed.useQuery({
    limit: 20,
    offset: 0,
  })

  const utils = trpc.useUtils()

  const handlePostCreated = () => {
    utils.posts.getFeed.invalidate()
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <AppNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 pt-4">
          {/* Left Sidebar */}
          <Sidebar activeItem="home" />

          {/* Main Feed */}
          <main className="flex-1 max-w-2xl">
            <CreatePost user={user} onPostCreated={handlePostCreated} />
            {isLoading && (
              <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-4 text-center text-muted-foreground">
                Loading posts...
              </div>
            )}
            {error && (
              <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-4 text-center text-destructive">
                Error loading posts: {error.message}
              </div>
            )}
            {posts && posts.length === 0 && (
              <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-4 text-center text-muted-foreground">
                No posts yet. Be the first to share something!
              </div>
            )}
            {posts?.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user.id} />
            ))}
          </main>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}
