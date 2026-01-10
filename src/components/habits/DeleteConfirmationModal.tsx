import { AlertTriangle } from 'lucide-react'

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
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {title}
            </h3>
            <p className="text-sm text-slate-600">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 cursor-pointer text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 cursor-pointer text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
