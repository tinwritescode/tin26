import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteConfirmationModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isOpen: boolean
}

export function DeleteConfirmationModal({
  title,
  message,
  onConfirm,
  onCancel,
  isOpen,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1 space-y-2">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{message}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="destructive">
            Delete
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
