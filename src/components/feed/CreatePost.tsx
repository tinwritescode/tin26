import { Image, Smile, Video } from 'lucide-react'
import type { User } from '../../types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CreatePostProps {
  user: User
}

export function CreatePost({ user }: CreatePostProps) {
  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user.email

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold cursor-pointer hover:opacity-90 transition-opacity duration-200">
          {getInitials(user)}
        </div>
        <Input
          type="text"
          placeholder={`What's on your mind, ${displayName.split(' ')[0]}?`}
          className="flex-1 bg-muted rounded-full border-0 placeholder-muted-foreground hover:bg-accent"
        />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Button variant="ghost" className="flex items-center gap-2">
          <Video className="w-5 h-5 text-red-500" />
          <span className="text-sm text-muted-foreground font-medium">Live video</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2">
          <Image className="w-5 h-5 text-green-500" />
          <span className="text-sm text-muted-foreground font-medium">
            Photo/video
          </span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-muted-foreground font-medium">
            Feeling/activity
          </span>
        </Button>
      </div>
    </div>
  )
}
