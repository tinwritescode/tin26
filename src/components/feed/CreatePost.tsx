import { Image, Smile, Video } from 'lucide-react'
import type { User } from '../../types/auth'

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
    <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity duration-200">
          {getInitials(user)}
        </div>
        <input
          type="text"
          placeholder={`What's on your mind, ${displayName.split(' ')[0]}?`}
          className="flex-1 bg-[#F0F2F5] rounded-full px-4 py-2 text-sm border-0 outline-0 placeholder-[#65676B] cursor-pointer hover:bg-[#E4E6EB] transition-colors duration-200"
        />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-[#CCD0D5]">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#F0F2F5] transition-colors duration-200 cursor-pointer">
          <Video className="w-5 h-5 text-[#F02849]" />
          <span className="text-sm text-[#65676B] font-medium">Live video</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#F0F2F5] transition-colors duration-200 cursor-pointer">
          <Image className="w-5 h-5 text-[#45BD62]" />
          <span className="text-sm text-[#65676B] font-medium">
            Photo/video
          </span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#F0F2F5] transition-colors duration-200 cursor-pointer">
          <Smile className="w-5 h-5 text-[#F7B928]" />
          <span className="text-sm text-[#65676B] font-medium">
            Feeling/activity
          </span>
        </button>
      </div>
    </div>
  )
}
