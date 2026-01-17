import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RouterOutput } from '../../lib/trpc'
import { formatRelativeTime } from '../../utils/time'

type Comment = RouterOutput<'posts'>['getComments'][number]

interface CommentItemProps {
  comment: Comment
  currentUserId: string
  onDelete: (commentId: string) => void
  isDeleting?: boolean
}

export function CommentItem({
  comment,
  currentUserId,
  onDelete,
  isDeleting = false,
}: CommentItemProps) {
  const isOwner = comment.userId === currentUserId

  const getInitials = (user: typeof comment.user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  const displayName = comment.user.firstName
    ? `${comment.user.firstName} ${comment.user.lastName || ''}`.trim()
    : comment.user.email

  return (
    <div className="group flex items-start gap-3 py-3 px-4 hover:bg-[#F0F2F5] transition-colors duration-200">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold flex-shrink-0">
        {comment.user.avatar ? (
          <img
            src={comment.user.avatar}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(comment.user)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(comment.id)}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
              aria-label="Delete comment"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
