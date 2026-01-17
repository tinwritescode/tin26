import type { Album } from '../../types/gallery'
import { AlbumCard } from './AlbumCard'
import { EmptyState } from '../habits/EmptyState'
import { Image } from 'lucide-react'

interface AlbumGridProps {
    albums: Album[]
    onAlbumClick: (albumId: string) => void
    currentUserId?: string
    onQuickUpload?: (albumId: string) => void
}

export function AlbumGrid({ albums, onAlbumClick, currentUserId, onQuickUpload }: AlbumGridProps) {
    if (albums.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-[#DBEAFE] p-8">
                <EmptyState
                    icon={Image}
                    title="No Albums Yet"
                    description="Create your first album to start organizing your photos."
                />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((album) => (
                <AlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => onAlbumClick(album.id)}
                    isOwner={currentUserId ? album.userId === currentUserId : false}
                    onQuickUpload={onQuickUpload ? (e) => {
                        e.stopPropagation()
                        onQuickUpload(album.id)
                    } : undefined}
                />
            ))}
        </div>
    )
}
