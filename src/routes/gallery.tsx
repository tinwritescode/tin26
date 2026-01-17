import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../common/hooks/useAuth'
import { trpc } from '../lib/trpc'
import { AppNav } from '../components/layout/AppNav'
import { Sidebar } from '../components/layout/Sidebar'
import { AlbumGrid } from '../components/gallery/AlbumGrid'
import { CreateAlbumModal } from '../components/gallery/CreateAlbumModal'
import { AddImageModal } from '../components/gallery/AddImageModal'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/gallery')({
    component: GalleryPage,
})

function GalleryPage() {
    const navigate = useNavigate()
    const { getToken } = useAuth()
    const hasToken = !!getToken()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [quickUploadAlbumId, setQuickUploadAlbumId] = useState<string | null>(null)

    const { data: userData, isLoading: userLoading } =
        trpc.auth.getCurrentUser.useQuery(undefined, {
            enabled: hasToken,
            retry: false,
        })

    const { data: albums = [], isLoading: albumsLoading } =
        trpc.gallery.getAlbums.useQuery(undefined, {
            enabled: hasToken && !!userData,
            retry: false,
        })

    const utils = trpc.useUtils()

    // Loading state
    if (userLoading || albumsLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <AppNav />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-4 pt-4">
                        <Sidebar activeItem="gallery" />
                        <main className="flex-1">
                            <div className="bg-white rounded-lg shadow-sm border border-[#DBEAFE] p-8">
                                <div className="text-center text-[#475569]">Loading...</div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }

    // Not logged in - show landing (handled by root layout)
    if (!userData) {
        return null
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <AppNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex gap-4 pt-4">
                    <Sidebar activeItem="gallery" />
                    <main className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm border border-[#DBEAFE] p-6 mb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-[#1E293B] mb-2">
                                        Photos
                                    </h1>
                                    <p className="text-sm text-[#475569]">
                                        {albums.length} {albums.length === 1 ? 'album' : 'albums'}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer transition-colors duration-200"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Album
                                </Button>
                            </div>
                        </div>

                        <AlbumGrid
                            albums={albums}
                            onAlbumClick={(albumId) => {
                                navigate({ to: '/gallery/$albumId', params: { albumId } })
                            }}
                            currentUserId={userData?.id}
                            onQuickUpload={(albumId) => {
                                setQuickUploadAlbumId(albumId)
                            }}
                        />

                        <CreateAlbumModal
                            open={isCreateModalOpen}
                            onOpenChange={setIsCreateModalOpen}
                            onSuccess={() => {
                                utils.gallery.getAlbums.invalidate()
                                setIsCreateModalOpen(false)
                            }}
                        />

                        {quickUploadAlbumId && (
                            <AddImageModal
                                open={!!quickUploadAlbumId}
                                onOpenChange={(open) => {
                                    if (!open) setQuickUploadAlbumId(null)
                                }}
                                albumId={quickUploadAlbumId}
                                onSuccess={() => {
                                    utils.gallery.getAlbums.invalidate()
                                    setQuickUploadAlbumId(null)
                                }}
                            />
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
