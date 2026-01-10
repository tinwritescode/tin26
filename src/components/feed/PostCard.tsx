import { useState } from 'react'
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Post } from '../../types/posts'
import { trpc } from '../../lib/trpc'
import { formatRelativeTime } from '../../utils/time'
import { useToast } from '@/components/ui/toast'

interface PostCardProps {
  post: Post
  currentUserId: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [shared, setShared] = useState(false)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [commentCount, setCommentCount] = useState(post._count.comments)
  const [shareCount, setShareCount] = useState(post._count.shares)
  const { toast } = useToast()

  const utils = trpc.useUtils()

  // Fetch initial interaction state
  const { data: interactions } = trpc.posts.getPostInteractions.useQuery(
    { postId: post.id },
    {
      onSuccess: (data) => {
        setLiked(data.liked)
        setShared(data.shared)
        setLikeCount(data.likeCount)
        setCommentCount(data.commentCount)
        setShareCount(data.shareCount)
      },
    },
  )

  const toggleLikeMutation = trpc.posts.toggleLike.useMutation({
    onMutate: async () => {
      // Optimistic update
      const newLiked = !liked
      const newLikeCount = newLiked ? likeCount + 1 : Math.max(0, likeCount - 1)
      setLiked(newLiked)
      setLikeCount(newLikeCount)
    },
    onSuccess: (data) => {
      setLiked(data.liked)
      setLikeCount(data.likeCount)
    },
    onError: () => {
      // Revert on error
      setLiked(!liked)
      setLikeCount(likeCount)
      toast({
        title: 'Error',
        description: 'Failed to update like',
        variant: 'destructive',
      })
    },
  })

  const shareMutation = trpc.posts.sharePost.useMutation({
    onMutate: async () => {
      // Optimistic update
      const newShared = !shared
      const newShareCount = newShared
        ? shareCount + 1
        : Math.max(0, shareCount - 1)
      setShared(newShared)
      setShareCount(newShareCount)
    },
    onSuccess: (data) => {
      setShared(data.shared)
      setShareCount(data.shareCount)
    },
    onError: () => {
      // Revert on error
      setShared(!shared)
      setShareCount(shareCount)
      toast({
        title: 'Error',
        description: 'Failed to share post',
        variant: 'destructive',
      })
    },
  })

  const deletePostMutation = trpc.posts.deletePost.useMutation({
    onSuccess: () => {
      utils.posts.getFeed.invalidate()
      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete post',
        variant: 'destructive',
      })
    },
  })

  const getInitials = (user: typeof post.user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  const displayName = post.user.firstName
    ? `${post.user.firstName} ${post.user.lastName || ''}`.trim()
    : post.user.email

  const isOwner = post.userId === currentUserId

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate({ postId: post.id })
    }
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border mb-4">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold cursor-pointer hover:opacity-90 transition-opacity duration-200">
              {post.user.avatar ? (
                <img
                  src={post.user.avatar}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(post.user)
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground cursor-pointer hover:underline">
                {displayName}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(post.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deletePostMutation.isPending}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Delete
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              className="rounded-full"
              aria-label="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Image */}
        {post.imageUrl && (
          <div className="w-full rounded-lg mb-3 overflow-hidden">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        {/* Stats */}
        {(likeCount > 0 || commentCount > 0 || shareCount > 0) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-4">
              {likeCount > 0 && <span>{likeCount} likes</span>}
              {commentCount > 0 && <span>{commentCount} comments</span>}
              {shareCount > 0 && <span>{shareCount} shares</span>}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-2 border-t border-border">
        <div className="flex items-center justify-around pt-1">
          <Button
            variant="ghost"
            className={`flex items-center gap-2 flex-1 ${
              liked ? 'text-blue-500' : ''
            }`}
            onClick={() => toggleLikeMutation.mutate({ postId: post.id })}
            disabled={toggleLikeMutation.isPending}
          >
            <ThumbsUp
              className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
            />
            <span className="text-sm font-medium">Like</span>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 flex-1">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex items-center gap-2 flex-1 ${
              shared ? 'text-green-500' : ''
            }`}
            onClick={() => shareMutation.mutate({ postId: post.id })}
            disabled={shareMutation.isPending}
          >
            <Share2 className={`w-5 h-5 ${shared ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">Share</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
