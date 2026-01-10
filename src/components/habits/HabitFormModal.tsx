import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { IconPicker } from './IconPicker'
import { getIcon } from '../../utils/icons'

interface HabitFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { icon: string; name: string; description?: string }) => void
  habit?: {
    id: string
    icon: string
    name: string
    description?: string | null
  } | null
  isLoading?: boolean
}

export function HabitFormModal({
  isOpen,
  onClose,
  onSubmit,
  habit,
  isLoading = false,
}: HabitFormModalProps) {
  const [icon, setIcon] = useState('CheckCircle')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{
    icon?: string
    name?: string
    description?: string
  }>({})

  useEffect(() => {
    if (isOpen) {
      if (habit) {
        setIcon(habit.icon)
        setName(habit.name)
        setDescription(habit.description || '')
      } else {
        setIcon('CheckCircle')
        setName('')
        setDescription('')
      }
      setErrors({})
    }
  }, [isOpen, habit])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: typeof errors = {}

    if (!icon) {
      newErrors.icon = 'Please select an icon'
    }

    if (!name.trim()) {
      newErrors.name = 'Habit name is required'
    } else if (name.trim().length > 100) {
      newErrors.name = 'Habit name must be 100 characters or less'
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      icon,
      name: name.trim(),
      description: description.trim() || undefined,
    })
    setErrors({})
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setIcon('CheckCircle')
    setErrors({})
    onClose()
  }

  const SelectedIcon = getIcon(icon)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            {habit ? 'Edit Habit' : 'Add Habit'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Icon Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Icon
            </label>
            <div className="mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50">
                <SelectedIcon className="w-5 h-5 text-slate-600" />
                <span className="text-sm text-slate-600">{icon}</span>
              </div>
            </div>
            <IconPicker selectedIcon={icon} onSelect={setIcon} />
            {errors.icon && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.icon}
              </p>
            )}
          </div>

          {/* Name Input */}
          <div className="mb-4">
            <label
              htmlFor="habit-name"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Habit Name <span className="text-red-500">*</span>
            </label>
            <input
              id="habit-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              placeholder="e.g., Drink 8 glasses of water"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              maxLength={100}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description Input */}
          <div className="mb-6">
            <label
              htmlFor="habit-description"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="habit-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setErrors((prev) => ({ ...prev, description: undefined }))
              }}
              placeholder="Add a note about this habit..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
              maxLength={500}
            />
            <div className="mt-1 flex justify-between">
              {errors.description && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-slate-500 ml-auto">
                {description.length}/500
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end border-t border-slate-200 pt-4">
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
              {isLoading ? (habit ? 'Saving...' : 'Adding...') : habit ? 'Save' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
