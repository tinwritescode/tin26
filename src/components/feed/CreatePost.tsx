import { useState, useRef } from 'react'
import { Image, Smile, Video, X } from 'lucide-react'
import type { User } from '../../types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '../../lib/trpc'
import { useToast } from '@/components/ui/toast'
import { useUploadThing } from '../../lib/uploadthing'

interface CreatePostProps {
  user: User
  onPostCreated?: () => void
}

export function CreatePost({ user, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const { toast } = useToast()

  const { startUpload, isUploading } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      console.log('Upload complete:', res)
      if (res && res[0]?.url) {
        setImageUrl(res[0].url)
        toast({
          title: 'Image uploaded',
          description: 'Your image has been uploaded successfully.',
        })
      } else {
        console.error('Upload response missing URL:', res)
        toast({
          title: 'Upload error',
          description: 'Upload completed but no URL received',
          variant: 'destructive',
        })
      }
    },
    onUploadError: (error) => {
      console.error('Upload error:', error)
      toast({
        title: 'Upload error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      })
    },
    onUploadBegin: (name) => {
      console.log('Upload beginning:', name)
    },
  })

  const utils = trpc.useUtils()
  const createPostMutation = trpc.posts.createPost.useMutation({
    onSuccess: () => {
      setContent('')
      setImageUrl(null)
      setIsExpanded(false)
      utils.posts.getFeed.invalidate()
      onPostCreated?.()
      toast({
        title: 'Post created',
        description: 'Your post has been shared successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create post',
        variant: 'destructive',
      })
    },
  })

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user.email

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    createPostMutation.mutate({
      content: content.trim(),
      imageUrl: imageUrl || null,
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selected:', e.target.files)
    const file = e.target.files?.[0]
    if (file) {
      console.log('Starting upload for file:', file.name, file.size, file.type)
      setIsExpanded(true)
      try {
        const result = startUpload([file])
        // Handle promise if returned
        if (result && typeof result.then === 'function') {
          result.catch((error) => {
            console.error('Upload promise rejected:', error)
            toast({
              title: 'Upload error',
              description: error.message || 'Failed to start upload',
              variant: 'destructive',
            })
          })
        }
      } catch (error) {
        console.error('Error starting upload:', error)
        toast({
          title: 'Upload error',
          description:
            error instanceof Error ? error.message : 'Failed to start upload',
          variant: 'destructive',
        })
      }
    } else {
      console.warn('No file selected')
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoButtonClick = () => {
    console.log('Photo button clicked, fileInputRef:', fileInputRef.current)
    // Trigger file input click first, before state update
    if (fileInputRef.current) {
      fileInputRef.current.click()
      // Expand after triggering click
      setIsExpanded(true)
    } else {
      console.error('File input ref is null')
      setIsExpanded(true)
    }
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-4">
      <form onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold cursor-pointer hover:opacity-90 transition-opacity duration-200">
            {getInitials(user)}
          </div>
          {isExpanded ? (
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`What's on your mind, ${displayName.split(' ')[0]}?`}
                className="bg-muted border-0 placeholder-muted-foreground min-h-[100px] resize-none"
                autoFocus
              />
              {imageUrl && (
                <div className="mt-3 relative">
                  <img
                    src={imageUrl}
                    alt="Upload preview"
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setImageUrl(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {isUploading && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Uploading image...
                </div>
              )}
            </div>
          ) : (
            <Input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder={`What's on your mind, ${displayName.split(' ')[0]}?`}
              className="flex-1 bg-muted rounded-full border-0 placeholder-muted-foreground hover:bg-accent cursor-pointer"
            />
          )}
        </div>

        {isExpanded && (
          <div className="flex items-center justify-between mb-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(false)
                setContent('')
                setImageUrl('')
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !content.trim() || createPostMutation.isPending || isUploading
              }
            >
              {createPostMutation.isPending
                ? 'Posting...'
                : isUploading
                  ? 'Uploading...'
                  : 'Post'}
            </Button>
          </div>
        )}

        {!isExpanded && (
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setIsExpanded(true)}
            >
              <Video className="w-5 h-5 text-red-500" />
              <span className="text-sm text-muted-foreground font-medium">
                Live video
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2"
              onClick={handlePhotoButtonClick}
              disabled={isUploading}
            >
              <Image className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground font-medium">
                Photo/video
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setIsExpanded(true)}
            >
              <Smile className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground font-medium">
                Feeling/activity
              </span>
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
