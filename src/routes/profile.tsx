import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../common/hooks/useAuth'
import { trpc } from '../lib/trpc'
import { AppNav } from '../components/layout/AppNav'
import { Sidebar } from '../components/layout/Sidebar'
import { RightSidebar } from '../components/layout/RightSidebar'
import { ProfileCover } from '../components/profile/ProfileCover'
import { ProfileHeader } from '../components/profile/ProfileHeader'
import { ProfileTabs } from '../components/profile/ProfileTabs'
import { TabsPanel } from '../components/ui/tabs'
import { AboutCard } from '../components/profile/AboutCard'
import { ProfileEditModal } from '../components/profile/ProfileEditModal'
import { Card } from '../components/ui/card'
import { CreatePost } from '../components/feed/CreatePost'
import { PostCard } from '../components/feed/PostCard'
import { PhotosGrid } from '../components/profile/PhotosGrid'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { getToken } = useAuth()
  const hasToken = !!getToken()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('about')

  const { data: userData } = trpc.auth.getCurrentUser.useQuery(undefined, {
    enabled: hasToken,
    retry: false,
  })

  // Transform dates from strings to Date objects
  const currentUser = userData
    ? {
        ...userData,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt),
      }
    : null

  const {
    data: profile,
    isLoading,
    refetch,
  } = trpc.profile.getProfile.useQuery(undefined, {
    enabled: hasToken && !!currentUser,
    retry: false,
  })

  const updateProfile = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      refetch()
      setEditModalOpen(false)
    },
  })

  const {
    data: userPosts,
    isLoading: postsLoading,
    error: postsError,
  } = trpc.posts.getUserPosts.useQuery(
    {
      userId: profile?.id || '',
      limit: 20,
      offset: 0,
    },
    {
      enabled: hasToken && !!currentUser && !!profile,
      retry: false,
    },
  )

  const utils = trpc.useUtils()

  const handlePostCreated = () => {
    utils.posts.getUserPosts.invalidate({ userId: profile?.id || '' })
  }

  const handleEditProfile = () => {
    setEditModalOpen(true)
  }

  const handleEditAvatar = () => {
    setEditModalOpen(true)
  }

  const handleEditCover = () => {
    setEditModalOpen(true)
  }

  const handleSaveProfile = (data: {
    firstName?: string | null
    lastName?: string | null
    bio?: string | null
    location?: string | null
    work?: string | null
    education?: string | null
    avatar?: string | null
    coverPhoto?: string | null
  }) => {
    updateProfile.mutate(data)
  }

  if (!hasToken || !currentUser) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <AppNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 pt-4">
            <Sidebar activeItem="profile" />
            <main className="flex-1 max-w-2xl">
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-8">
                <div className="text-center text-[#65676B]">Loading...</div>
              </div>
            </main>
            <RightSidebar />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const isOwnProfile = profile.id === currentUser.id

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <AppNav />
      <div className="w-full">
        {/* Cover Photo - Full Width */}
        <ProfileCover
          coverPhoto={profile.coverPhoto}
          isOwnProfile={isOwnProfile}
          onEditCover={handleEditCover}
        />

        {/* Profile Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 pt-4">
            <Sidebar activeItem="profile" />
            <main className="flex-1 min-w-0">
              {/* Profile Header */}
              <ProfileHeader
                user={profile}
                isOwnProfile={isOwnProfile}
                onEditAvatar={handleEditAvatar}
                onEditProfile={handleEditProfile}
              />

              {/* Tabs and Content */}
              <div className="mt-8 pb-8">
                <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab}>
                  <TabsPanel value="about" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      <div className="lg:col-span-2">
                        <AboutCard user={profile} />
                      </div>
                      <div className="lg:col-span-3">
                        <Card>
                          <div className="p-6 text-center text-muted-foreground">
                            More content coming soon
                          </div>
                        </Card>
                      </div>
                    </div>
                  </TabsPanel>
                  <TabsPanel value="posts" className="mt-6">
                    {isOwnProfile && currentUser && (
                      <div className="mb-6">
                        <CreatePost
                          user={currentUser}
                          onPostCreated={handlePostCreated}
                        />
                      </div>
                    )}
                    {postsLoading && (
                      <Card>
                        <div className="p-6 text-center text-muted-foreground">
                          Loading posts...
                        </div>
                      </Card>
                    )}
                    {postsError && (
                      <Card>
                        <div className="p-6 text-center text-destructive">
                          Error loading posts: {postsError.message}
                        </div>
                      </Card>
                    )}
                    {!postsLoading &&
                      !postsError &&
                      userPosts &&
                      userPosts.length === 0 && (
                        <Card>
                          <div className="p-6 text-center text-muted-foreground">
                            {isOwnProfile
                              ? "You haven't shared any posts yet."
                              : 'No posts yet.'}
                          </div>
                        </Card>
                      )}
                    {userPosts?.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={currentUser?.id || ''}
                      />
                    ))}
                  </TabsPanel>
                  <TabsPanel value="photos" className="mt-6">
                    <PhotosGrid
                      posts={userPosts}
                      isLoading={postsLoading}
                      error={postsError}
                      isOwnProfile={isOwnProfile}
                    />
                  </TabsPanel>
                </ProfileTabs>
              </div>
            </main>
            <RightSidebar />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isOwnProfile && (
        <ProfileEditModal
          user={profile}
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}
