import type { Image } from '../../types/gallery'
import { EmptyState } from '../habits/EmptyState'
import { Image as ImageIcon } from 'lucide-react'

interface ImageGridProps {
  images: Image[]
  onImageClick: (index: number) => void
}

export function ImageGrid({ images, onImageClick }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-8">
        <EmptyState
          icon={ImageIcon}
          title="No Photos Yet"
          description="Add photos to this album to get started."
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {images.map((image, index) => (
        <div
          key={image.id}
          onClick={() => onImageClick(index)}
          className="relative aspect-square overflow-hidden rounded-lg bg-[#F8FAFC] cursor-pointer group hover:opacity-90 hover:ring-2 hover:ring-[#2563EB] transition-all duration-200"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onImageClick(index)
            }
          }}
          aria-label={image.description || `Photo ${index + 1}`}
        >
          <img
            src={image.url}
            alt={image.description || `Photo ${index + 1} in album`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
        </div>
      ))}
    </div>
  )
}
