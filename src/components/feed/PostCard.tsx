import { ThumbsUp, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'

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
    <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] mb-4">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity duration-200">
              {post.author.avatar}
            </div>
            <div>
              <div className="text-sm font-semibold text-[#050505] cursor-pointer hover:underline">
                {post.author.name}
              </div>
              <div className="text-xs text-[#65676B]">{post.time}</div>
            </div>
          </div>
          <button className="p-1.5 rounded-full hover:bg-[#F0F2F5] transition-colors duration-200 cursor-pointer">
            <MoreHorizontal className="w-5 h-5 text-[#65676B]" />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-[#050505] mb-3">{post.content}</p>

        {/* Image placeholder */}
        {post.image && (
          <div className="w-full h-64 bg-[#F0F2F5] rounded-lg mb-3 flex items-center justify-center text-[#65676B]">
            Image placeholder
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-[#65676B] pt-2 border-t border-[#CCD0D5]">
          <div className="flex items-center gap-4">
            <span>{post.likes} likes</span>
            <span>{post.comments} comments</span>
            <span>{post.shares} shares</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-2 border-t border-[#CCD0D5]">
        <div className="flex items-center justify-around pt-1">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#F0F2F5] transition-colors duration-200 cursor-pointer flex-1 justify-center">
            <ThumbsUp className="w-5 h-5 text-[#65676B]" />
            <span className="text-sm font-medium text-[#65676B]">Like</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#F0F2F5] transition-colors duration-200 cursor-pointer flex-1 justify-center">
            <MessageCircle className="w-5 h-5 text-[#65676B]" />
            <span className="text-sm font-medium text-[#65676B]">Comment</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#F0F2F5] transition-colors duration-200 cursor-pointer flex-1 justify-center">
            <Share2 className="w-5 h-5 text-[#65676B]" />
            <span className="text-sm font-medium text-[#65676B]">Share</span>
          </button>
        </div>
      </div>
    </div>
  )
}
