import { Camera, MapPin, Briefcase, GraduationCap, Edit } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { useState } from 'react'

interface ProfileHeaderProps {
  user: {
    id: string
    firstName?: string | null
    lastName?: string | null
    avatar?: string | null
    bio?: string | null
    location?: string | null
    work?: string | null
    education?: string | null
  }
  isOwnProfile: boolean
  onEditAvatar?: () => void
  onEditProfile?: () => void
}

export function ProfileHeader({
  user,
  isOwnProfile,
  onEditAvatar,
  onEditProfile,
}: ProfileHeaderProps) {
  const [bioExpanded, setBioExpanded] = useState(false)
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
  const bio = user.bio || ''
  const shouldTruncateBio = bio.length > 150

  return (
    <div className="relative -mt-[84px] md:-mt-[60px] mb-6">
      <div className="w-full">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-end px-4 md:px-0">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-[168px] h-[168px] md:w-[120px] md:h-[120px] border-4 border-background shadow-lg">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={fullName} />
              ) : null}
              <AvatarFallback className="text-4xl md:text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full cursor-pointer"
                onClick={onEditAvatar}
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-2xl font-bold text-foreground mb-2">
              {fullName}
            </h1>

            {/* Bio */}
            {bio && (
              <div className="mb-3">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {bioExpanded || !shouldTruncateBio
                    ? bio
                    : `${bio.slice(0, 150)}...`}
                  {shouldTruncateBio && (
                    <button
                      onClick={() => setBioExpanded(!bioExpanded)}
                      className="ml-1 text-primary hover:underline cursor-pointer font-medium"
                    >
                      {bioExpanded ? 'See less' : 'See more'}
                    </button>
                  )}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.work && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>{user.work}</span>
                </div>
              )}
              {user.education && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>{user.education}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isOwnProfile ? (
              <Button
                variant="default"
                className="cursor-pointer"
                onClick={onEditProfile}
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </Button>
            ) : (
              <>
                <Button variant="default" className="cursor-pointer">
                  Add Friend
                </Button>
                <Button variant="outline" className="cursor-pointer">
                  Message
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
