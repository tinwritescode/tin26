import { Home, Target, LayoutList, BarChart3 } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'

interface SidebarProps {
  activeItem?: string
}

export function Sidebar({ activeItem }: SidebarProps) {
  const location = useLocation()
  const currentPath = location.pathname

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'habits', label: 'Habits', icon: Target, path: '/habits' },
    {
      id: 'templates',
      label: 'Templates',
      icon: LayoutList,
      path: '/templates',
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: BarChart3,
      path: '/statistics',
    },
    // AI PROMPT: Build a comprehensive Habits tracking system
    //
    // DATABASE SCHEMA (Prisma):
    // 1. Add to User model: `appliedTemplateId String?` (nullable foreign key to HabitTemplate)
    // 2. Create HabitTemplate model:
    //    - id (String, cuid)
    //    - userId (String, foreign key to User)
    //    - name (String)
    //    - createdAt, updatedAt (DateTime)
    //    - habits (Habit[], one-to-many)
    // 3. Create Habit model:
    //    - id (String, cuid)
    //    - templateId (String, foreign key to HabitTemplate)
    //    - icon (String, e.g., "CheckCircle" from lucide-react)
    //    - name (String)
    //    - description (String?, optional)
    //    - createdAt, updatedAt (DateTime)
    // 4. Create HabitCompletion model:
    //    - id (String, cuid)
    //    - userId (String, foreign key to User)
    //    - habitId (String, foreign key to Habit)
    //    - completedAt (DateTime, default now)
    //    - date (String, format: "YYYY-MM-DD" for daily tracking)
    //    - unique constraint on (userId, habitId, date)
    //
    // BACKEND (tRPC):
    // Create `habits` router in src/server/trpc/router/habits.ts with:
    // - getActiveTemplate: returns user's active template with habits
    // - setActiveTemplate: sets appliedTemplateId for user
    // - getTodaysCompletions: returns completed habit IDs for today
    // - toggleHabitCompletion: marks/unmarks habit as completed for today
    // - getTemplates: returns all templates for user
    // - createTemplate: creates new template
    // - updateTemplate: updates template name
    // - deleteTemplate: deletes template
    // - addHabitToTemplate: adds habit to template
    // - updateHabit: updates habit (icon, name, description)
    // - deleteHabit: removes habit from template
    //
    // FRONTEND PAGES:
    // 1. Create src/routes/habits.tsx:
    //    - If user has no appliedTemplateId: show message "No active template. Go to Templates to activate one."
    //    - If appliedTemplateId exists: fetch active template with habits
    //    - Display all habits from active template
    //    - Each habit shows: icon (from lucide-react), name, description (if exists)
    //    - Check if it's a new day (compare current date with last completion date)
    //    - If new day, reset all completions (show all habits as uncompleted)
    //    - Clicking a habit toggles completion for today (visual feedback: checked/unchecked)
    //    - Use date format "YYYY-MM-DD" for daily tracking
    //
    // 2. Create src/routes/templates.tsx:
    //    - List all user's templates
    //    - Show which template is active (appliedTemplateId)
    //    - Actions: Create, Edit name, Delete, Activate, Manage habits
    //    - "Manage habits" opens modal/page to:
    //      - Add habit: show icon picker (use lucide-react icon list), name input, optional description
    //      - Edit existing habits (icon, name, description)
    //      - Delete habits
    //
    // 3. Update Sidebar.tsx:
    //    - Add "Habits" menu item below "Home" with appropriate icon (e.g., Target or CheckSquare from lucide-react)
    //    - Add "Templates" menu item (or make it accessible from Habits page)
    //
    // UI/UX REQUIREMENTS:
    // - Use existing Tailwind styling patterns from the codebase
    // - Icons: Use lucide-react (already in use)
    // - For icon picker: Display grid of lucide-react icons, user clicks to select
    // - Daily reset: Automatically detect new day and reset completions
    // - Visual feedback: Completed habits should have distinct styling (e.g., checkmark, different background)
    // - Responsive design following existing patterns
    //
    // TECHNICAL NOTES:
    // - Use TanStack Router file-based routing (create files in src/routes/)
    // - Use tRPC for all API calls (follow existing patterns in src/lib/trpc.ts)
    // - Follow existing code structure and patterns
    // - Use TypeScript throughout
    // - Handle loading and error states appropriately
  ]

  return (
    <aside className="hidden lg:block w-64 pt-4">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id || currentPath === item.path
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                isActive ? 'bg-[#E4E6EB] font-semibold' : 'hover:bg-[#F0F2F5]'
              }`}
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? 'text-[#1877F2]' : 'text-[#050505]'
                }`}
              />
              <span
                className={`text-sm ${
                  isActive ? 'text-[#050505]' : 'text-[#050505]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
