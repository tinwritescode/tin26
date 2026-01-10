import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../common/hooks/useAuth'
import { trpc } from '../lib/trpc'
import { LandingNav } from '../components/landing/LandingNav'
import { LandingHero } from '../components/landing/LandingHero'
import { AppNav } from '../components/layout/AppNav'
import { Sidebar } from '../components/layout/Sidebar'
import { RightSidebar } from '../components/layout/RightSidebar'
import { CreatePost } from '../components/feed/CreatePost'
import { PostCard } from '../components/feed/PostCard'
import { mockPosts } from '../data/mockPosts'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { login, getToken } = useAuth()
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
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <AppNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 pt-4">
            {/* Left Sidebar */}
            <Sidebar activeItem="home" />

            {/* Main Feed */}
            <main className="flex-1 max-w-2xl">
              <CreatePost user={user} />
              {mockPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </main>

            {/* Right Sidebar */}
            <RightSidebar />
          </div>
        </div>
      </div>
    )
  }

  return null
}
