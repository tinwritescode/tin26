import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../common/hooks/useAuth'
import { trpc } from '../lib/trpc'
import { AppNav } from '../components/layout/AppNav'
import { Sidebar } from '../components/layout/Sidebar'
import { RightSidebar } from '../components/layout/RightSidebar'
import { HabitCard } from '../components/habits/HabitCard'
import { EmptyState } from '../components/habits/EmptyState'
import { Target } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/habits')({
  component: HabitsPage,
})

function HabitsPage() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const hasToken = !!getToken()

  const { data: userData, isLoading: userLoading } =
    trpc.auth.getCurrentUser.useQuery(undefined, {
      enabled: hasToken,
      retry: false,
    })

  const { data: activeTemplate, isLoading: templateLoading } =
    trpc.habits.getActiveTemplate.useQuery(undefined, {
      enabled: hasToken && !!userData,
      retry: false,
    })

  const today = new Date().toISOString().split('T')[0]
  const { data: completedHabitIds = [], isLoading: completionsLoading } =
    trpc.habits.getTodaysCompletions.useQuery(undefined, {
      enabled: hasToken && !!userData && !!activeTemplate,
      retry: false,
    })

  const { data: completionCounts = {}, isLoading: countsLoading } =
    trpc.habits.getTodaysCompletionCounts.useQuery(undefined, {
      enabled: hasToken && !!userData && !!activeTemplate,
      retry: false,
    })

  const utils = trpc.useUtils()
  const toggleCompletion = trpc.habits.toggleHabitCompletion.useMutation({
    onSuccess: () => {
      // Invalidate queries to refetch
      utils.habits.getTodaysCompletions.invalidate()
      utils.habits.getTodaysCompletionCounts.invalidate()
    },
  })
  const decreaseCompletion = trpc.habits.decreaseHabitCompletion.useMutation({
    onSuccess: () => {
      // Invalidate queries to refetch
      utils.habits.getTodaysCompletions.invalidate()
      utils.habits.getTodaysCompletionCounts.invalidate()
    },
  })

  // Daily reset detection - store last date in localStorage
  useEffect(() => {
    const storedDate = localStorage.getItem('habits_last_date')
    const currentDate = new Date().toISOString().split('T')[0]

    if (storedDate !== currentDate) {
      // New day detected - reset is handled by backend (completions are date-specific)
      localStorage.setItem('habits_last_date', currentDate)
    }
  }, [])

  const handleToggleCompletion = (habitId: string) => {
    toggleCompletion.mutate(
      {
        habitId,
        date: today,
      },
      {
        onError: (error) => {
          console.error('Failed to toggle habit completion:', error)
          // Could add toast notification here
        },
      },
    )
  }

  const handleDecreaseCompletion = (habitId: string) => {
    decreaseCompletion.mutate(
      {
        habitId,
        date: today,
      },
      {
        onError: (error) => {
          console.error('Failed to decrease habit completion:', error)
          // Could add toast notification here
        },
      },
    )
  }

  // Loading state
  if (userLoading || templateLoading || completionsLoading || countsLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <AppNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 pt-4">
            <Sidebar activeItem="habits" />
            <main className="flex-1 max-w-2xl">
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-8">
                <div className="text-center text-[#65676B]">Loading...</div>
              </div>
            </main>
            <RightSidebar />
          </div>
        </div>
      </div>
    )
  }

  // Not logged in - show landing (handled by root layout)
  if (!userData) {
    return null
  }

  // No active template
  if (!activeTemplate) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <AppNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 pt-4">
            <Sidebar activeItem="habits" />
            <main className="flex-1 max-w-2xl">
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-8">
                <EmptyState
                  icon={Target}
                  title="No Active Template"
                  description="You don't have an active habit template. Go to Templates to create or activate one."
                  actionLabel="Go to Templates"
                  onAction={() => {
                    navigate({ to: '/templates' })
                  }}
                />
                <div className="text-center mt-4">
                  <Link
                    to="/templates"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer text-sm font-medium"
                  >
                    Go to Templates
                  </Link>
                </div>
              </div>
            </main>
            <RightSidebar />
          </div>
        </div>
      </div>
    )
  }

  // Has active template - show habits
  const habits = activeTemplate.habits || []

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <AppNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 pt-4">
          <Sidebar activeItem="habits" />
          <main className="flex-1 max-w-2xl">
            <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6 mb-4">
              <h1 className="text-2xl font-bold text-[#050505] mb-2">
                {activeTemplate.name}
              </h1>
              <p className="text-sm text-[#65676B]">
                {habits.length} {habits.length === 1 ? 'habit' : 'habits'} for
                today
              </p>
            </div>

            {habits.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-8">
                <EmptyState
                  icon={Target}
                  title="No Habits Yet"
                  description="This template doesn't have any habits. Go to Templates to manage habits."
                  actionLabel="Manage Templates"
                  onAction={() => {
                    navigate({ to: '/templates' })
                  }}
                />
                <div className="text-center mt-4">
                  <Link
                    to="/templates"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer text-sm font-medium"
                  >
                    Manage Templates
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={completedHabitIds.includes(habit.id)}
                    completionCount={completionCounts[habit.id] || 0}
                    onToggle={() => handleToggleCompletion(habit.id)}
                    onDecrease={() => handleDecreaseCompletion(habit.id)}
                  />
                ))}
              </div>
            )}
          </main>
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}
