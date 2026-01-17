import { useState, useEffect } from 'react'
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogPanel, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '../../lib/trpc'
import { useToast } from '@/components/ui/toast'
import type { Image } from '../../types/gallery'
import { Form } from '../ui/form'

interface EditImageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: Image
  onSuccess?: () => void
}

export function EditImageModal({
  open,
  onOpenChange,
  image,
  onSuccess,
}: EditImageModalProps) {
  const [description, setDescription] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (image) {
      setDescription(image.description || '')
    }
  }, [image])

  const utils = trpc.useUtils()
  const updateImageMutation = trpc.gallery.updateImage.useMutation({
    onSuccess: () => {
      onOpenChange(false)
      // Invalidate album to refresh image data
      utils.gallery.getAlbum.invalidate({ albumId: image.albumId })
      onSuccess?.()
      toast({
        title: 'Image updated',
        description: 'Your image description has been updated.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update image',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!image) return

    updateImageMutation.mutate({
      imageId: image.id,
      description: description.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <Form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Photo Description</DialogTitle>
          </DialogHeader>
          <DialogPanel>
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={image.url}
                  alt={image.description || 'Photo to edit'}
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-image-description"
                  className="text-sm font-medium text-[#1E293B] mb-2 block"
                >
                  Description
                </label>
                <Textarea
                  id="edit-image-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Photo description (optional)"
                  maxLength={500}
                  rows={3}
                />
              </div>
            </div>
          </DialogPanel>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateImageMutation.isPending}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer transition-colors duration-200"
            >
              {updateImageMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  )
}
