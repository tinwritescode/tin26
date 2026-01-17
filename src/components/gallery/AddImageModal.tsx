import { useState, useRef } from 'react'
import { Image, X } from 'lucide-react'
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogPanel, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '../../lib/trpc'
import { useToast } from '@/components/ui/toast'
import { useUploadThing } from '../../lib/uploadthing'
import { Form } from '../ui/form'

interface AddImageModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    albumId: string
    onSuccess?: () => void
}

export function AddImageModal({
    open,
    onOpenChange,
    albumId,
    onSuccess,
}: AddImageModalProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [description, setDescription] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { startUpload, isUploading } = useUploadThing('imageUploader', {
        onClientUploadComplete: (res) => {
            if (res && res[0]?.url) {
                setImageUrl(res[0].url)
                toast({
                    title: 'Image uploaded',
                    description: 'Your image has been uploaded successfully.',
                })
            } else {
                toast({
                    title: 'Upload error',
                    description: 'Upload completed but no URL received',
                    variant: 'destructive',
                })
            }
        },
        onUploadError: (error) => {
            toast({
                title: 'Upload error',
                description: error.message || 'Failed to upload image',
                variant: 'destructive',
            })
        },
    })

    const utils = trpc.useUtils()
    const addImageMutation = trpc.gallery.addImage.useMutation({
        onSuccess: () => {
            setImageUrl(null)
            setDescription('')
            setIsDragging(false)
            onOpenChange(false)
            utils.gallery.getAlbum.invalidate({ albumId })
            onSuccess?.()
            toast({
                title: 'Image added',
                description: 'Your image has been added to the album.',
            })
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to add image',
                variant: 'destructive',
            })
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!imageUrl) return

        addImageMutation.mutate({
            albumId,
            url: imageUrl,
            description: description.trim() || null,
        })
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            startUpload([file])
        }
        e.target.value = ''
    }

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            startUpload([file])
        } else {
            toast({
                title: 'Invalid file',
                description: 'Please drop an image file',
                variant: 'destructive',
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPopup>
                <Form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Photo</DialogTitle>
                    </DialogHeader>
                    <DialogPanel>
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="add-image-file"
                                    className="text-sm font-medium text-[#1E293B] mb-2 block"
                                >
                                    Photo *
                                </label>
                                <input
                                    id="add-image-file"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                    aria-required="true"
                                />
                                {imageUrl ? (
                                    <div className="relative">
                                        <img
                                            src={imageUrl}
                                            alt="Photo preview"
                                            className="w-full max-h-64 object-cover rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white cursor-pointer"
                                            onClick={() => setImageUrl(null)}
                                            aria-label="Remove photo"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={handleImageClick}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${isDragging
                                            ? 'border-[#2563EB] bg-[#EFF6FF] scale-[1.02]'
                                            : 'border-[#DBEAFE] hover:border-[#2563EB]'
                                            }`}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                handleImageClick()
                                            }
                                        }}
                                        aria-label="Upload photo"
                                    >
                                        <Image className="w-12 h-12 text-[#60A5FA] mx-auto mb-2" aria-hidden="true" />
                                        <p className="text-sm text-[#475569] font-medium mb-1">
                                            {isUploading ? 'Uploading...' : isDragging ? 'Drop photo here' : 'Click to upload or drag and drop'}
                                        </p>
                                        <p className="text-xs text-[#64748B]">
                                            PNG, JPG, GIF up to 4MB
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="add-image-description"
                                    className="text-sm font-medium text-[#1E293B] mb-2 block"
                                >
                                    Description
                                </label>
                                <Textarea
                                    id="add-image-description"
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
                            disabled={!imageUrl || addImageMutation.isPending || isUploading}
                            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer transition-colors duration-200"
                        >
                            {addImageMutation.isPending ? 'Adding...' : 'Add Photo'}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogPopup>
        </Dialog>
    )
}
