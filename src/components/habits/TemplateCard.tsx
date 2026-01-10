import { Check, Edit, Trash2, Play, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Template {
  id: string
  name: string
  habits?: { id: string }[]
}

interface TemplateCardProps {
  template: Template
  isActive: boolean
  onActivate: () => void
  onDeactivate: () => void
  onEdit: () => void
  onDelete: () => void
  onManageHabits: () => void
}

export function TemplateCard({
  template,
  isActive,
  onActivate,
  onDeactivate,
  onEdit,
  onDelete,
  onManageHabits,
}: TemplateCardProps) {
  const habitCount = template.habits?.length || 0

  return (
    <div
      className={`bg-card rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer ${
        isActive
          ? 'border-primary shadow-md'
          : 'border-border hover:border-primary/50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">{template.name}</h3>
            {isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {habitCount} {habitCount === 1 ? 'habit' : 'habits'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {!isActive ? (
          <Button
            onClick={onActivate}
            size="sm"
            aria-label={`Activate ${template.name}`}
          >
            <Play className="w-4 h-4" />
            Activate
          </Button>
        ) : (
          <Button
            onClick={onDeactivate}
            size="sm"
            variant="secondary"
            aria-label={`Deactivate ${template.name}`}
          >
            <X className="w-4 h-4" />
            Deactivate
          </Button>
        )}
        <Button
          onClick={onManageHabits}
          size="sm"
          variant="outline"
          aria-label={`Manage habits for ${template.name}`}
        >
          <Settings className="w-4 h-4" />
          Manage Habits
        </Button>
        <Button
          onClick={onEdit}
          size="sm"
          variant="outline"
          aria-label={`Edit ${template.name}`}
        >
          <Edit className="w-4 h-4" />
          Edit
        </Button>
        <Button
          onClick={onDelete}
          size="sm"
          variant="destructive-outline"
          aria-label={`Delete ${template.name}`}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>
  )
}
