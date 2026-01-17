import { useState, useRef, useEffect } from 'react'
import { Image, X } from 'lucide-react'
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogPanel, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '../../lib/trpc'
import { useToast } from '@/components/ui/toast'
import { useUploadThing } from '../../lib/uploadthing'
import type { Album } from '../../types/gallery'
import { Form } from '../ui/form'

interface EditAlbumModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    album: Album | null
    onSuccess?: () => void
}

export function EditAlbumModal({
    open,
    onOpenChange,
    album,
    onSuccess,
}: EditAlbumModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (album) {
            setTitle(album.title)
            setDescription(album.description || '')
            setThumbnailUrl(album.thumbnailUrl)
        }
    }, [album])

    const { startUpload, isUploading } = useUploadThing('imageUploader', {
        onClientUploadComplete: (res) => {
            if (res && res[0]?.url) {
                setThumbnailUrl(res[0].url)
                toast({
                    title: 'Thumbnail uploaded',
                    description: 'Your thumbnail has been uploaded successfully.',
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
                description: error.message || 'Failed to upload thumbnail',
                variant: 'destructive',
            })
        },
    })

    const utils = trpc.useUtils()
    const updateAlbumMutation = trpc.gallery.updateAlbum.useMutation({
        onSuccess: () => {
            onOpenChange(false)
            utils.gallery.getAlbums.invalidate()
            if (album) {
                utils.gallery.getAlbum.invalidate({ albumId: album.id })
            }
            onSuccess?.()
            toast({
                title: 'Album updated',
                description: 'Your album has been updated successfully.',
            })
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update album',
                variant: 'destructive',
            })
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !album) return

        updateAlbumMutation.mutate({
            albumId: album.id,
            title: title.trim(),
            description: description.trim() || null,
            thumbnailUrl: thumbnailUrl || null,
        })
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            startUpload([file])
        }
        e.target.value = ''
    }

    const handleThumbnailClick = () => {
        fileInputRef.current?.click()
    }

    if (!album) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPopup>
                <Form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Album</DialogTitle>
                    </DialogHeader>
                    <DialogPanel>
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="edit-album-title"
                                    className="text-sm font-medium text-[#1E293B] mb-2 block"
                                >
                                    Title *
                                </label>
                                <Input
                                    id="edit-album-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Album title"
                                    required
                                    maxLength={200}
                                    aria-required="true"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="edit-album-description"
                                    className="text-sm font-medium text-[#1E293B] mb-2 block"
                                >
                                    Description
                                </label>
                                <Textarea
                                    id="edit-album-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Album description (optional)"
                                    maxLength={1000}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="edit-album-thumbnail"
                                    className="text-sm font-medium text-[#1E293B] mb-2 block"
                                >
                                    Thumbnail
                                </label>
                                <input
                                    id="edit-album-thumbnail"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                    aria-label="Upload album thumbnail"
                                />
                                {thumbnailUrl ? (
                                    <div className="relative">
                                        <img
                                            src={thumbnailUrl}
                                            alt="Album thumbnail preview"
                                            className="w-full max-h-64 object-cover rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white cursor-pointer"
                                            onClick={() => setThumbnailUrl(null)}
                                            aria-label="Remove thumbnail"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={handleThumbnailClick}
                                        className="border-2 border-dashed border-[#DBEAFE] rounded-lg p-8 text-center cursor-pointer hover:border-[#2563EB] transition-colors duration-200"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                handleThumbnailClick()
                                            }
                                        }}
                                        aria-label="Upload thumbnail"
                                    >
                                        <Image className="w-12 h-12 text-[#60A5FA] mx-auto mb-2" aria-hidden="true" />
                                        <p className="text-sm text-[#475569]">
                                            {isUploading ? 'Uploading...' : 'Click to upload thumbnail'}
                                        </p>
                                    </div>
                                )}
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
                            disabled={!title.trim() || updateAlbumMutation.isPending || isUploading}
                            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer transition-colors duration-200"
                        >
                            {updateAlbumMutation.isPending ? 'Updating...' : 'Update Album'}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogPopup>
        </Dialog>
    )
}
