import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../common/hooks/useAuth'
import { trpc } from '../lib/trpc'
import { AppNav } from '../components/layout/AppNav'
import { Sidebar } from '../components/layout/Sidebar'
import { RightSidebar } from '../components/layout/RightSidebar'
import { TemplateCard } from '../components/habits/TemplateCard'
import { EmptyState } from '../components/habits/EmptyState'
import { CreateTemplateModal } from '../components/habits/CreateTemplateModal'
import { EditTemplateModal } from '../components/habits/EditTemplateModal'
import { DeleteConfirmationModal } from '../components/habits/DeleteConfirmationModal'
import { HabitFormModal } from '../components/habits/HabitFormModal'
import { LayoutList, Plus, Trash2, Edit } from 'lucide-react'
import { getIcon } from '../utils/icons'

export const Route = createFileRoute('/templates')({
  component: TemplatesPage,
})

function TemplatesPage() {
  const { getToken } = useAuth()
  const hasToken = !!getToken()

  const { data: userData, isLoading: userLoading } =
    trpc.auth.getCurrentUser.useQuery(undefined, {
      enabled: hasToken,
      retry: false,
    })

  const { data: templates = [], isLoading: templatesLoading } =
    trpc.habits.getTemplates.useQuery(undefined, {
      enabled: hasToken && !!userData,
      retry: false,
    })

  const activeTemplateId = userData?.appliedTemplateId || null

  const utils = trpc.useUtils()

  // Template mutations
  const createTemplate = trpc.habits.createTemplate.useMutation({
    onSuccess: () => {
      utils.habits.getTemplates.invalidate()
      setShowCreateModal(false)
    },
  })

  const updateTemplate = trpc.habits.updateTemplate.useMutation({
    onSuccess: () => {
      utils.habits.getTemplates.invalidate()
      setShowEditModal(false)
      setEditingTemplate(null)
    },
  })

  const deleteTemplate = trpc.habits.deleteTemplate.useMutation({
    onSuccess: () => {
      utils.habits.getTemplates.invalidate()
      utils.habits.getActiveTemplate.invalidate()
      setShowDeleteModal(false)
      setDeletingTemplate(null)
    },
  })

  const setActiveTemplate = trpc.habits.setActiveTemplate.useMutation({
    onSuccess: () => {
      utils.habits.getTemplates.invalidate()
      utils.auth.getCurrentUser.invalidate()
      utils.habits.getActiveTemplate.invalidate()
    },
  })

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<{
    id: string
    name: string
  } | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingTemplate, setDeletingTemplate] = useState<{
    id: string
    name: string
  } | null>(null)
  const [managingHabitsTemplateId, setManagingHabitsTemplateId] = useState<
    string | null
  >(null)
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<{
    id: string
    icon: string
    name: string
    description?: string | null
    type?: string
  } | null>(null)
  const [showDeleteHabitModal, setShowDeleteHabitModal] = useState(false)
  const [deletingHabit, setDeletingHabit] = useState<{
    id: string
    name: string
  } | null>(null)

  // Habit mutations
  const addHabit = trpc.habits.addHabitToTemplate.useMutation({
    onSuccess: () => {
      utils.habits.getTemplates.invalidate()
      if (managingHabitsTemplateId) {
        utils.habits.getTemplate.invalidate({
          templateId: managingHabitsTemplateId,
        })
      }
      setShowHabitModal(false)
      setEditingHabit(null)
    },
  })

  const updateHabit = trpc.habits.updateHabit.useMutation({
    onSuccess: () => {
      utils.habits.getTemplates.invalidate()
      if (managingHabitsTemplateId) {
        utils.habits.getTemplate.invalidate({
          templateId: managingHabitsTemplateId,
        })
      }
      setShowHabitModal(false)
      setEditingHabit(null)
    },
  })

  const deleteHabit = trpc.habits.deleteHabit.useMutation({
    onSuccess: () => {
      utils.habits.getTemplates.invalidate()
      if (managingHabitsTemplateId) {
        utils.habits.getTemplate.invalidate({
          templateId: managingHabitsTemplateId,
        })
      }
      setShowDeleteHabitModal(false)
      setDeletingHabit(null)
    },
  })

  // Get template with habits for managing
  const { data: templateWithHabits } = trpc.habits.getTemplate.useQuery(
    { templateId: managingHabitsTemplateId || '' },
    {
      enabled: !!managingHabitsTemplateId,
      retry: false,
    },
  )

  const handleCreateTemplate = (name: string) => {
    createTemplate.mutate({ name })
  }

  const handleEditTemplate = (name: string) => {
    if (editingTemplate) {
      updateTemplate.mutate({
        templateId: editingTemplate.id,
        name,
      })
    }
  }

  const handleDeleteTemplate = () => {
    if (deletingTemplate) {
      deleteTemplate.mutate({ templateId: deletingTemplate.id })
    }
  }

  const handleActivateTemplate = (templateId: string) => {
    setActiveTemplate.mutate({ templateId })
  }

  const handleDeactivateTemplate = () => {
    setActiveTemplate.mutate({ templateId: null })
  }

  const handleManageHabits = (templateId: string) => {
    setManagingHabitsTemplateId(templateId)
  }

  const handleCloseHabitManagement = () => {
    setManagingHabitsTemplateId(null)
    setShowHabitModal(false)
    setEditingHabit(null)
  }

  const handleAddHabit = () => {
    setEditingHabit(null)
    setShowHabitModal(true)
  }

  const handleEditHabit = (habit: {
    id: string
    icon: string
    name: string
    description?: string | null
    type?: string
  }) => {
    setEditingHabit(habit)
    setShowHabitModal(true)
  }

  const handleDeleteHabit = () => {
    if (deletingHabit && managingHabitsTemplateId) {
      deleteHabit.mutate({ habitId: deletingHabit.id })
    }
  }

  const handleSubmitHabit = (data: {
    icon: string
    name: string
    description?: string
    type?: 'once_per_day' | 'repeatable'
  }) => {
    if (!managingHabitsTemplateId) return

    if (editingHabit) {
      updateHabit.mutate({
        habitId: editingHabit.id,
        ...data,
      })
    } else {
      addHabit.mutate({
        templateId: managingHabitsTemplateId,
        ...data,
      })
    }
  }

  // Loading state
  if (userLoading || templatesLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <AppNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 pt-4">
            <Sidebar activeItem="templates" />
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

  // Not logged in
  if (!userData) {
    return null
  }

  // Habit management view
  if (managingHabitsTemplateId && templateWithHabits) {
    const habits = templateWithHabits.habits || []

    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <AppNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 pt-4">
            <Sidebar activeItem="templates" />
            <main className="flex-1 max-w-2xl">
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-[#050505] mb-1">
                      Manage Habits: {templateWithHabits.name}
                    </h1>
                    <p className="text-sm text-[#65676B]">
                      {habits.length} {habits.length === 1 ? 'habit' : 'habits'}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseHabitManagement}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 cursor-pointer text-sm font-medium"
                  >
                    Back to Templates
                  </button>
                </div>
                <button
                  onClick={handleAddHabit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Habit
                </button>
              </div>

              {habits.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-8">
                  <EmptyState
                    icon={LayoutList}
                    title="No Habits Yet"
                    description="Add your first habit to this template."
                    actionLabel="Add Habit"
                    onAction={handleAddHabit}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {habits.map((habit) => {
                    const Icon = getIcon(habit.icon)
                    return (
                      <div
                        key={habit.id}
                        className="bg-white rounded-lg border border-slate-200 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-800 mb-1">
                              {habit.name}
                            </h3>
                            {habit.description && (
                              <p className="text-sm text-slate-500">
                                {habit.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditHabit(habit)}
                              className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
                              aria-label={`Edit ${habit.name}`}
                            >
                              <Edit className="w-4 h-4 text-slate-600" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingHabit({
                                  id: habit.id,
                                  name: habit.name,
                                })
                                setShowDeleteHabitModal(true)
                              }}
                              className="p-2 rounded-lg hover:bg-red-100 transition-colors duration-200 cursor-pointer"
                              aria-label={`Delete ${habit.name}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </main>
            <RightSidebar />
          </div>
        </div>

        {/* Habit Form Modal */}
        <HabitFormModal
          isOpen={showHabitModal}
          onClose={() => {
            setShowHabitModal(false)
            setEditingHabit(null)
          }}
          onSubmit={handleSubmitHabit}
          habit={editingHabit}
          isLoading={addHabit.isPending || updateHabit.isPending}
        />

        {/* Delete Habit Confirmation */}
        <DeleteConfirmationModal
          isOpen={showDeleteHabitModal}
          title="Delete Habit"
          message={`Are you sure you want to delete "${deletingHabit?.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteHabit}
          onCancel={() => {
            setShowDeleteHabitModal(false)
            setDeletingHabit(null)
          }}
        />
      </div>
    )
  }

  // Templates list view
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <AppNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 pt-4">
          <Sidebar activeItem="templates" />
          <main className="flex-1 max-w-2xl">
            <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-[#050505]">Templates</h1>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Template
                </button>
              </div>
              <p className="text-sm text-[#65676B]">
                Manage your habit templates and activate one to start tracking
              </p>
            </div>

            {templates.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-8">
                <EmptyState
                  icon={LayoutList}
                  title="No Templates Yet"
                  description="Create your first template to start tracking habits."
                  actionLabel="Create Template"
                  onAction={() => setShowCreateModal(true)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isActive={template.id === activeTemplateId}
                    onActivate={() => handleActivateTemplate(template.id)}
                    onDeactivate={handleDeactivateTemplate}
                    onEdit={() => {
                      setEditingTemplate({
                        id: template.id,
                        name: template.name,
                      })
                      setShowEditModal(true)
                    }}
                    onDelete={() => {
                      setDeletingTemplate({
                        id: template.id,
                        name: template.name,
                      })
                      setShowDeleteModal(true)
                    }}
                    onManageHabits={() => handleManageHabits(template.id)}
                  />
                ))}
              </div>
            )}
          </main>
          <RightSidebar />
        </div>
      </div>

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTemplate}
        isLoading={createTemplate.isPending}
      />

      {/* Edit Template Modal */}
      <EditTemplateModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingTemplate(null)
        }}
        onSubmit={handleEditTemplate}
        currentName={editingTemplate?.name || ''}
        isLoading={updateTemplate.isPending}
      />

      {/* Delete Template Confirmation */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Template"
        message={`Are you sure you want to delete "${deletingTemplate?.name}"? This will also delete all habits in this template. This action cannot be undone.`}
        onConfirm={handleDeleteTemplate}
        onCancel={() => {
          setShowDeleteModal(false)
          setDeletingTemplate(null)
        }}
      />
    </div>
  )
}
