import { Check, Edit, Trash2, Play, Settings, X } from 'lucide-react'

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
      className={`bg-white rounded-lg border-2 p-4 transition-all duration-200 ${
        isActive
          ? 'border-blue-500 shadow-md'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-800">{template.name}</h3>
            {isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {habitCount} {habitCount === 1 ? 'habit' : 'habits'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {!isActive ? (
          <button
            onClick={onActivate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer text-sm font-medium"
            aria-label={`Activate ${template.name}`}
          >
            <Play className="w-4 h-4" />
            Activate
          </button>
        ) : (
          <button
            onClick={onDeactivate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 cursor-pointer text-sm font-medium"
            aria-label={`Deactivate ${template.name}`}
          >
            <X className="w-4 h-4" />
            Deactivate
          </button>
        )}
        <button
          onClick={onManageHabits}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 cursor-pointer text-sm font-medium"
          aria-label={`Manage habits for ${template.name}`}
        >
          <Settings className="w-4 h-4" />
          Manage Habits
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 cursor-pointer text-sm font-medium"
          aria-label={`Edit ${template.name}`}
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 cursor-pointer text-sm font-medium"
          aria-label={`Delete ${template.name}`}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  )
}
