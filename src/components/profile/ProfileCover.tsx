import { Camera } from 'lucide-react'
import { Button } from '../ui/button'

interface ProfileCoverProps {
  coverPhoto?: string | null
  isOwnProfile: boolean
  onEditCover?: () => void
}

export function ProfileCover({
  coverPhoto,
  isOwnProfile,
  onEditCover,
}: ProfileCoverProps) {
  return (
    <div className="relative w-full h-[400px] md:h-[350px] sm:h-[280px] overflow-hidden bg-muted">
      {coverPhoto ? (
        <img
          src={coverPhoto}
          alt="Cover photo"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      {isOwnProfile && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 cursor-pointer"
          onClick={onEditCover}
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Edit Cover</span>
        </Button>
      )}
    </div>
  )
}
