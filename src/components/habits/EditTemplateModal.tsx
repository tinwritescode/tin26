import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogPanel,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Form } from '@/components/ui/form'

interface EditTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => void
  currentName: string
  isLoading?: boolean
}

export function EditTemplateModal({
  isOpen,
  onClose,
  onSubmit,
  currentName,
  isLoading = false,
}: EditTemplateModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(currentName)
      setError('')
    }
  }, [isOpen, currentName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Template name is required')
      return
    }

    if (name.trim().length > 100) {
      setError('Template name must be 100 characters or less')
      return
    }

    onSubmit(name.trim())
    setError('')
  }

  const handleClose = () => {
    setName(currentName)
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPopup className="max-w-md">
        <Form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <DialogPanel>
            <Field>
              <FieldLabel>Template Name</FieldLabel>
              <Input
                id="edit-template-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                placeholder="e.g., Morning Routine"
                disabled={isLoading}
                maxLength={100}
                aria-invalid={!!error}
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
          </DialogPanel>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  )
}
