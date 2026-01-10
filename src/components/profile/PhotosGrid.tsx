import { useState } from 'react'
import { X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogPopup } from '@/components/ui/dialog'
import type { Post } from '../../types/posts'

interface PhotosGridProps {
  posts: Post[] | undefined
  isLoading: boolean
  error: { message: string } | null | undefined
  isOwnProfile: boolean
}

export function PhotosGrid({
  posts,
  isLoading,
  error,
  isOwnProfile,
}: PhotosGridProps) {
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    postId: string
  } | null>(null)

  // Filter posts that have images
  const postsWithImages = posts?.filter((post) => post.imageUrl) || []
  const photos = postsWithImages.map((post) => ({
    id: post.id,
    url: post.imageUrl!,
    createdAt: post.createdAt,
  }))

  if (isLoading) {
    return (
      <Card>
        <div className="p-6 text-center text-muted-foreground">
          Loading photos...
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="p-6 text-center text-destructive">
          Error loading photos: {error.message}
        </div>
      </Card>
    )
  }

  if (photos.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center text-muted-foreground">
          {isOwnProfile
            ? "You haven't shared any photos yet."
            : 'No photos yet.'}
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer group hover:opacity-90 transition-opacity duration-200"
            onClick={() =>
              setSelectedImage({ url: photo.url, postId: photo.id })
            }
          >
            <img
              src={photo.url}
              alt="Post photo"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        >
          <DialogPopup
            className="max-w-5xl w-full p-0 bg-transparent border-0 shadow-none"
            showCloseButton={false}
          >
            <div className="relative flex items-center justify-center min-h-[50vh]">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white cursor-pointer"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-5 h-5" />
              </Button>
              <img
                src={selectedImage.url}
                alt="Post photo"
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />
            </div>
          </DialogPopup>
        </Dialog>
      )}
    </>
  )
}
