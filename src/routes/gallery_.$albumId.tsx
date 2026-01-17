import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useAuth } from '../common/hooks/useAuth'
import { trpc } from '../lib/trpc'
import { AppNav } from '../components/layout/AppNav'
import { Sidebar } from '../components/layout/Sidebar'
import { ImageGrid } from '../components/gallery/ImageGrid'
import { ImageLightbox } from '../components/gallery/ImageLightbox'
import { AddImageModal } from '../components/gallery/AddImageModal'
import { EditAlbumModal } from '../components/gallery/EditAlbumModal'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/gallery_/$albumId')({
    component: AlbumDetailPage,
})

function AlbumDetailPage() {
    const navigate = useNavigate()
    const { albumId } = useParams({ from: '/gallery_/$albumId' })
    const { getToken } = useAuth()
    const hasToken = !!getToken()
    const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false)
    const [isEditAlbumModalOpen, setIsEditAlbumModalOpen] = useState(false)
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

    const { data: userData, isLoading: userLoading } =
        trpc.auth.getCurrentUser.useQuery(undefined, {
            enabled: hasToken,
            retry: false,
        })

    const { data: album, isLoading: albumLoading, error: albumError } =
        trpc.gallery.getAlbum.useQuery(
            { albumId },
            {
                enabled: hasToken && !!userData,
                retry: false,
            },
        )

    const utils = trpc.useUtils()

    const isOwner = album?.userId === userData?.id

    // Loading state
    if (userLoading || albumLoading) {
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

    // Error state
    if (albumError) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <AppNav />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-4 pt-4">
                        <Sidebar activeItem="gallery" />
                        <main className="flex-1">
                            <div className="bg-white rounded-lg shadow-sm border border-[#DBEAFE] p-8">
                                <div className="text-center">
                                    <p className="text-[#DC2626] font-medium mb-2">Error loading album</p>
                                    <p className="text-sm text-[#475569]">
                                        {albumError.message || 'Failed to load album. Please try again.'}
                                    </p>
                                    <Button
                                        onClick={() => navigate({ to: '/gallery' })}
                                        variant="outline"
                                        className="mt-4 cursor-pointer transition-colors duration-200"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Gallery
                                    </Button>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }

    if (!album) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <AppNav />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-4 pt-4">
                        <Sidebar activeItem="gallery" />
                        <main className="flex-1">
                            <div className="bg-white rounded-lg shadow-sm border border-[#DBEAFE] p-8">
                                <div className="text-center">
                                    <p className="text-[#475569] font-medium mb-2">Album not found</p>
                                    <p className="text-sm text-[#64748B] mb-4">
                                        The album you're looking for doesn't exist or has been deleted.
                                    </p>
                                    <Button
                                        onClick={() => navigate({ to: '/gallery' })}
                                        variant="outline"
                                        className="cursor-pointer transition-colors duration-200"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Gallery
                                    </Button>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <AppNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex gap-4 pt-4">
                    <Sidebar activeItem="gallery" />
                    <main className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm border border-[#DBEAFE] p-6 mb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Link
                                    to="/gallery"
                                    className="text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer transition-colors duration-200"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-[#1E293B] mb-1">
                                        {album.title}
                                    </h1>
                                    {album.description && (
                                        <p className="text-sm text-[#475569]">{album.description}</p>
                                    )}
                                    <p className="text-sm text-[#475569] mt-1">
                                        {album.images.length}{' '}
                                        {album.images.length === 1 ? 'photo' : 'photos'}
                                    </p>
                                </div>
                                {isOwner && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditAlbumModalOpen(true)}
                                            className="cursor-pointer transition-colors duration-200"
                                        >
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => setIsAddImageModalOpen(true)}
                                            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer transition-colors duration-200"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Photos
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <ImageGrid
                            images={album.images}
                            onImageClick={(index) => setSelectedImageIndex(index)}
                        />

                        {selectedImageIndex !== null && (
                            <ImageLightbox
                                images={album.images}
                                initialIndex={selectedImageIndex}
                                onClose={() => setSelectedImageIndex(null)}
                                isOwner={isOwner}
                            />
                        )}

                        {isOwner && (
                            <>
                                <AddImageModal
                                    open={isAddImageModalOpen}
                                    onOpenChange={setIsAddImageModalOpen}
                                    albumId={albumId}
                                    onSuccess={() => {
                                        utils.gallery.getAlbum.invalidate({ albumId })
                                        setIsAddImageModalOpen(false)
                                    }}
                                />
                                <EditAlbumModal
                                    open={isEditAlbumModalOpen}
                                    onOpenChange={setIsEditAlbumModalOpen}
                                    album={album}
                                    onSuccess={() => {
                                        utils.gallery.getAlbum.invalidate({ albumId })
                                        setIsEditAlbumModalOpen(false)
                                    }}
                                />
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
