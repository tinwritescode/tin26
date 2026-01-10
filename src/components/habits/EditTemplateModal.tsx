import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

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

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">
            Edit Template
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="edit-template-name"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Template Name
            </label>
            <input
              id="edit-template-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="e.g., Morning Routine"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              maxLength={100}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 cursor-pointer text-sm font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
