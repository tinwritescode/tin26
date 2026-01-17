import type { Album } from '../../types/gallery'
import { Image, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AlbumCardProps {
    album: Album
    onClick: () => void
    isOwner?: boolean
    onQuickUpload?: (e: React.MouseEvent) => void
}

export function AlbumCard({ album, onClick, isOwner, onQuickUpload }: AlbumCardProps) {
    const imageCount = album._count.images

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking the upload button
        if ((e.target as HTMLElement).closest('[data-upload-button]')) {
            return
        }
        onClick()
    }

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-lg shadow-sm border border-[#DBEAFE] overflow-hidden cursor-pointer hover:shadow-md hover:border-[#60A5FA] transition-all duration-200 group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick()
                }
            }}
            aria-label={`View album: ${album.title}`}
        >
            <div className="relative aspect-square bg-[#F8FAFC]">
                {album.thumbnailUrl ? (
                    <img
                        src={album.thumbnailUrl}
                        alt={`${album.title} album thumbnail`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-16 h-16 text-[#60A5FA]" aria-hidden="true" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                {imageCount > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-sm font-medium">
                            {imageCount} {imageCount === 1 ? 'photo' : 'photos'}
                        </p>
                    </div>
                )}
                {isOwner && onQuickUpload && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                            data-upload-button
                            size="icon-xs"
                            onClick={(e) => {
                                e.stopPropagation()
                                onQuickUpload(e)
                            }}
                            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer transition-colors duration-200 shadow-lg"
                            aria-label="Quick upload to album"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
            <div className="p-3">
                <h3 className="font-semibold text-[#1E293B] text-sm line-clamp-1">
                    {album.title}
                </h3>
                {album.description && (
                    <p className="text-xs text-[#475569] mt-1 line-clamp-2">
                        {album.description}
                    </p>
                )}
            </div>
        </div>
    )
}
