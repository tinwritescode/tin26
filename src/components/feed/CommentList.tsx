import { CommentItem } from './CommentItem'
import type { RouterOutput } from '../../lib/trpc'

type Comment = RouterOutput<'posts'>['getComments'][number]

interface CommentListProps {
  comments: Comment[]
  currentUserId: string
  onDelete: (commentId: string) => void
  deletingCommentId?: string | null
}

export function CommentList({
  comments,
  currentUserId,
  onDelete,
  deletingCommentId,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onDelete={onDelete}
          isDeleting={deletingCommentId === comment.id}
        />
      ))}
    </div>
  )
}
