import { useState } from 'react'
import { Popover, PopoverTrigger, PopoverPopup } from '@/components/ui/popover'
import type { RouterOutput } from '../../lib/trpc'
import { trpc } from '../../lib/trpc'

type LikedUser = RouterOutput<'posts'>['getLikedUsers'][number]

interface LikedUsersPopoverProps {
  postId: string
  likeCount: number
  currentUserId: string
  userLiked: boolean
  children: React.ReactNode
}

export function LikedUsersPopover({
  postId,
  likeCount,
  currentUserId,
  userLiked,
  children,
}: LikedUsersPopoverProps) {
  const [open, setOpen] = useState(false)

  const { data: likedUsers = [] } = trpc.posts.getLikedUsers.useQuery(
    { postId, limit: 10 },
    {
      enabled: likeCount > 0 && open,
    },
  )

  const getInitials = (user: LikedUser['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  const getDisplayName = (user: LikedUser['user']) => {
    if (user.firstName) {
      return `${user.firstName} ${user.lastName || ''}`.trim()
    }
    return user.email
  }

  const remainingCount = likeCount - likedUsers.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="cursor-pointer hover:underline"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverPopup
        side="top"
        align="start"
        sideOffset={8}
        className="w-[280px] max-w-[calc(100vw-2rem)] p-0"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="p-3">
          <h4 className="text-sm font-semibold text-foreground mb-2">
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {likedUsers.map((like) => {
              const isCurrentUser = like.userId === currentUserId
              return (
                <div
                  key={like.id}
                  className="flex items-center gap-2 py-1"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold flex-shrink-0">
                    {like.user.avatar ? (
                      <img
                        src={like.user.avatar}
                        alt={getDisplayName(like.user)}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(like.user)
                    )}
                  </div>
                  <span className="text-sm text-foreground">
                    {isCurrentUser ? 'You' : getDisplayName(like.user)}
                  </span>
                </div>
              )
            })}
            {remainingCount > 0 && (
              <div className="text-sm text-muted-foreground pt-1 border-t border-border">
                and {remainingCount} more
              </div>
            )}
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  )
}
