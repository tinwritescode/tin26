import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { Dialog, DialogPopup } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EditImageModal } from './EditImageModal'
import type { Image } from '../../types/gallery'

interface ImageLightboxProps {
  images: Image[]
  initialIndex: number
  onClose: () => void
  isOwner: boolean
}

export function ImageLightbox({
  images,
  initialIndex,
  onClose,
  isOwner,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const currentImage = images[currentIndex]

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') onClose()
  }

  if (!currentImage) return null

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogPopup
          className="max-w-7xl w-full p-0 bg-black/90 border-0 shadow-none"
          showCloseButton={false}
        >
          <div
            className="relative flex items-center justify-center min-h-screen"
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white cursor-pointer transition-colors duration-200"
              onClick={onClose}
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Edit button (owner only) */}
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-16 z-10 bg-black/50 hover:bg-black/70 text-white cursor-pointer transition-colors duration-200"
                onClick={() => setIsEditModalOpen(true)}
                aria-label="Edit photo description"
              >
                <Pencil className="w-5 h-5" />
              </Button>
            )}

            {/* Previous button */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-10 bg-black/50 hover:bg-black/70 text-white cursor-pointer transition-colors duration-200"
                onClick={handlePrevious}
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}

            {/* Image */}
            <div className="flex flex-col items-center justify-center p-8">
              <img
                src={currentImage.url}
                alt={currentImage.description || `Photo ${currentIndex + 1} of ${images.length}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              {currentImage.description && (
                <p className="mt-4 text-white text-center max-w-2xl">
                  {currentImage.description}
                </p>
              )}
              {images.length > 1 && (
                <p className="mt-2 text-white/70 text-sm">
                  {currentIndex + 1} of {images.length}
                </p>
              )}
            </div>

            {/* Next button */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-10 bg-black/50 hover:bg-black/70 text-white cursor-pointer transition-colors duration-200"
                onClick={handleNext}
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}
          </div>
        </DialogPopup>
      </Dialog>

      {isOwner && (
        <EditImageModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          image={currentImage}
          onSuccess={() => {
            setIsEditModalOpen(false)
            // Refresh will be handled by parent
          }}
        />
      )}
    </>
  )
}
