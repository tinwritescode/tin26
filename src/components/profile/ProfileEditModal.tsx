import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
  Dialog,
  DialogPopup as DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPanel,
} from '../ui/dialog'
import { Form } from '../ui/form'

interface ProfileEditModalProps {
  user: {
    firstName?: string | null
    lastName?: string | null
    bio?: string | null
    location?: string | null
    work?: string | null
    education?: string | null
    avatar?: string | null
    coverPhoto?: string | null
  }
  open: boolean
  onClose: () => void
  onSave: (data: {
    firstName?: string | null
    lastName?: string | null
    bio?: string | null
    location?: string | null
    work?: string | null
    education?: string | null
    avatar?: string | null
    coverPhoto?: string | null
  }) => void
}

export function ProfileEditModal({
  user,
  open,
  onClose,
  onSave,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    location: user.location || '',
    work: user.work || '',
    education: user.education || '',
    avatar: user.avatar || '',
    coverPhoto: user.coverPhoto || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      firstName: formData.firstName || null,
      lastName: formData.lastName || null,
      bio: formData.bio || null,
      location: formData.location || null,
      work: formData.work || null,
      education: formData.education || null,
      avatar: formData.avatar || null,
      coverPhoto: formData.coverPhoto || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <Form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <DialogPanel>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                First Name
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Last Name
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Bio</label>
            <Textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us about yourself"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.bio.length}/500
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Location</label>
            <Input
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="City, Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Work</label>
            <Input
              value={formData.work}
              onChange={(e) =>
                setFormData({ ...formData, work: e.target.value })
              }
              placeholder="Company, Position"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Education
            </label>
            <Input
              value={formData.education}
              onChange={(e) =>
                setFormData({ ...formData, education: e.target.value })
              }
              placeholder="School, Degree"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Avatar URL
            </label>
            <Input
              value={formData.avatar}
              onChange={(e) =>
                setFormData({ ...formData, avatar: e.target.value })
              }
              placeholder="https://example.com/avatar.jpg"
              type="url"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Cover Photo URL
            </label>
            <Input
              value={formData.coverPhoto}
              onChange={(e) =>
                setFormData({ ...formData, coverPhoto: e.target.value })
              }
              placeholder="https://example.com/cover.jpg"
              type="url"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer">
              Save Changes
            </Button>
          </div>
          </DialogPanel>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
