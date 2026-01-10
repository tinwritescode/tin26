import { CheckCircle2 } from 'lucide-react'
import { getIcon } from '../../utils/icons'
import { motion } from 'framer-motion'
import { useRef } from 'react'

interface Habit {
  id: string
  icon: string
  name: string
  description?: string | null
  type?: string
}

interface HabitCardProps {
  habit: Habit
  isCompleted: boolean
  completionCount?: number
  onToggle: () => void
  onDecrease?: () => void
}

export function HabitCard({
  habit,
  isCompleted,
  completionCount = 0,
  onToggle,
  onDecrease,
}: HabitCardProps) {
  const Icon = getIcon(habit.icon)
  const isRepeatable = habit.type === 'repeatable'
  const hasDragged = useRef(false)

  const handleDragStart = () => {
    hasDragged.current = false
  }

  const handleDrag = () => {
    hasDragged.current = true
  }

  const handleDragEnd = (_event: any, info: any) => {
    // Check if it's a left swipe (negative offset) with sufficient velocity or distance
    const isLeftSwipe =
      info.offset.x < -50 || (info.offset.x < -20 && info.velocity.x < -500)

    if (isLeftSwipe && onDecrease) {
      onDecrease()
    }

    // Reset after animation completes
    setTimeout(() => {
      hasDragged.current = false
    }, 200)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onToggle()
  }

  const canSwipe = isRepeatable && completionCount > 0

  return (
    <motion.button
      onClick={handleClick}
      onDragStart={canSwipe ? handleDragStart : undefined}
      onDrag={canSwipe ? handleDrag : undefined}
      onDragEnd={canSwipe ? handleDragEnd : undefined}
      drag={canSwipe ? 'x' : false}
      dragConstraints={canSwipe ? { left: -80, right: 0 } : undefined}
      dragElastic={canSwipe ? 0 : undefined}
      dragMomentum={false}
      dragSnapToOrigin={canSwipe}
      dragDirectionLock={canSwipe}
      whileDrag={canSwipe ? { opacity: 0.8, scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer text-left ${
        isCompleted
          ? 'bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-800 dark:hover:bg-green-950/30'
          : 'bg-card border-border hover:border-primary/50 hover:bg-accent'
      }`}
      aria-label={
        isRepeatable
          ? `Add completion for ${habit.name} (${completionCount} times today)`
          : `${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}: ${habit.name}`
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
            isCompleted
              ? 'bg-green-500 text-white'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {isCompleted && !isRepeatable ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Icon className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3
              className={`font-medium ${
                isCompleted && !isRepeatable
                  ? 'text-green-800 dark:text-green-300 line-through'
                  : 'text-foreground'
              }`}
            >
              {habit.name}
            </h3>
            {isRepeatable && completionCount > 0 && (
              <span className="shrink-0 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {completionCount}x
              </span>
            )}
          </div>
          {habit.description && (
            <p
              className={`text-sm ${
                isCompleted && !isRepeatable
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-muted-foreground'
              }`}
            >
              {habit.description}
            </p>
          )}
          {isRepeatable && (
            <p className="text-xs text-muted-foreground mt-1">
              Click to add completion
              {completionCount > 0 && ', swipe left to decrease'}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  )
}
