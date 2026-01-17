import { useState, useEffect } from 'react'
import { IconPicker } from './IconPicker'
import { getIcon } from '../../utils/icons'
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogPanel,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form } from '@/components/ui/form'
import { cn } from '@/components/lib/utils'

interface HabitFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    icon: string
    name: string
    description?: string
    type?: 'once_per_day' | 'repeatable'
  }) => void
  habit?: {
    id: string
    icon: string
    name: string
    description?: string | null
    type?: string
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
  const [type, setType] = useState<'once_per_day' | 'repeatable'>(
    'once_per_day',
  )
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
        setType((habit.type as 'once_per_day' | 'repeatable') || 'once_per_day')
      } else {
        setIcon('CheckCircle')
        setName('')
        setDescription('')
        setType('once_per_day')
      }
      setErrors({})
    }
  }, [isOpen, habit])

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
      type,
    })
    setErrors({})
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setIcon('CheckCircle')
    setType('once_per_day')
    setErrors({})
    onClose()
  }

  const SelectedIcon = getIcon(icon)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPopup className="max-w-2xl max-h-[90vh]">
        <Form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{habit ? 'Edit Habit' : 'Add Habit'}</DialogTitle>
          </DialogHeader>
          <DialogPanel>
            {/* Icon Picker */}
            <div className="mb-6">
              <Field>
                <FieldLabel>Icon</FieldLabel>
                <div className="mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-2 border border-input rounded-lg bg-muted">
                    <SelectedIcon className="w-5 h-5 text-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {icon}
                    </span>
                  </div>
                </div>
                <IconPicker selectedIcon={icon} onSelect={setIcon} />
                {errors.icon && <FieldError>{errors.icon}</FieldError>}
              </Field>
            </div>

            {/* Name Input */}
            <div className="mb-6">
              <Field>
                <FieldLabel>
                  Habit Name <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="habit-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="e.g., Drink 8 glasses of water"
                  disabled={isLoading}
                  maxLength={100}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </Field>
            </div>

            {/* Description Input */}
            <div className="mb-6">
              <Field>
                <FieldLabel>Description (Optional)</FieldLabel>
                <Textarea
                  id="habit-description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    setErrors((prev) => ({ ...prev, description: undefined }))
                  }}
                  placeholder="Add a note about this habit..."
                  rows={3}
                  disabled={isLoading}
                  maxLength={500}
                  aria-invalid={!!errors.description}
                />
                <div className="mt-1 flex justify-between">
                  {errors.description && (
                    <FieldError>{errors.description}</FieldError>
                  )}
                  <p className="text-xs text-muted-foreground ml-auto">
                    {description.length}/500
                  </p>
                </div>
              </Field>
            </div>

            {/* Type Selection */}
            <div className="mb-4">
              <Field>
                <FieldLabel>
                  Habit Type <span className="text-red-500">*</span>
                </FieldLabel>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Card
                    onClick={() => !isLoading && setType('once_per_day')}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
                        e.preventDefault()
                        setType('once_per_day')
                      }
                    }}
                    tabIndex={isLoading ? -1 : 0}
                    role="button"
                    aria-pressed={type === 'once_per_day'}
                    aria-label="Select Once Per Day habit type"
                    className={cn(
                      'cursor-pointer border-2',
                      'transition-[border-color,background-color,box-shadow] duration-200 ease-out',
                      'hover:shadow-lg hover:border-primary/50 hover:bg-accent/50',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      type === 'once_per_day'
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50',
                      isLoading && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <CardHeader className="pb-3 gap-2">
                      <CardTitle className="text-base">Once Per Day</CardTitle>
                      <CardDescription className="text-xs">
                        Complete once per day (e.g., Morning meditation)
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card
                    onClick={() => !isLoading && setType('repeatable')}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
                        e.preventDefault()
                        setType('repeatable')
                      }
                    }}
                    tabIndex={isLoading ? -1 : 0}
                    role="button"
                    aria-pressed={type === 'repeatable'}
                    aria-label="Select Repeatable habit type"
                    className={cn(
                      'cursor-pointer border-2',
                      'transition-[border-color,background-color,box-shadow] duration-200 ease-out',
                      'hover:shadow-lg hover:border-primary/50 hover:bg-accent/50',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      type === 'repeatable'
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50',
                      isLoading && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <CardHeader className="pb-3 gap-2">
                      <CardTitle className="text-base">Repeatable</CardTitle>
                      <CardDescription className="text-xs">
                        Complete multiple times per day (e.g., Drink 8 glasses
                        of water)
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </Field>
            </div>
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
              {isLoading
                ? habit
                  ? 'Saving...'
                  : 'Adding...'
                : habit
                  ? 'Save'
                  : 'Add Habit'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  )
}
