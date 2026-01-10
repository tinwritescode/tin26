import { CheckCircle2 } from 'lucide-react'
import { getIcon } from '../../utils/icons'

interface Habit {
  id: string
  icon: string
  name: string
  description?: string | null
}

interface HabitCardProps {
  habit: Habit
  isCompleted: boolean
  onToggle: () => void
}

export function HabitCard({ habit, isCompleted, onToggle }: HabitCardProps) {
  const Icon = getIcon(habit.icon)

  return (
    <button
      onClick={onToggle}
      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer text-left ${
        isCompleted
          ? 'bg-green-50 border-green-200 hover:bg-green-100'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
      aria-label={`${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}: ${habit.name}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
            isCompleted
              ? 'bg-green-500 text-white'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Icon className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium mb-1 ${
              isCompleted ? 'text-green-800 line-through' : 'text-slate-800'
            }`}
          >
            {habit.name}
          </h3>
          {habit.description && (
            <p
              className={`text-sm ${
                isCompleted ? 'text-green-600' : 'text-slate-500'
              }`}
            >
              {habit.description}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
