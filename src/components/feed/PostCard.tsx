import { ThumbsUp, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Post {
  id: string
  author: {
    name: string
    avatar: string
  }
  time: string
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border mb-4">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold cursor-pointer hover:opacity-90 transition-opacity duration-200">
              {post.author.avatar}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground cursor-pointer hover:underline">
                {post.author.name}
              </div>
              <div className="text-xs text-muted-foreground">{post.time}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-full"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground mb-3">{post.content}</p>

        {/* Image placeholder */}
        {post.image && (
          <div className="w-full h-64 bg-muted rounded-lg mb-3 flex items-center justify-center text-muted-foreground">
            Image placeholder
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-4">
            <span>{post.likes} likes</span>
            <span>{post.comments} comments</span>
            <span>{post.shares} shares</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-2 border-t border-border">
        <div className="flex items-center justify-around pt-1">
          <Button variant="ghost" className="flex items-center gap-2 flex-1">
            <ThumbsUp className="w-5 h-5" />
            <span className="text-sm font-medium">Like</span>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 flex-1">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 flex-1">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
