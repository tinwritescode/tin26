import { Link, useLocation } from '@tanstack/react-router'
import { BarChart3, Home, Image, LayoutList, Target, User } from 'lucide-react'

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
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: Image,
      path: '/gallery',
    }
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
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${isActive ? 'bg-[#E4E6EB] font-semibold' : 'hover:bg-[#F0F2F5]'
                }`}
            >
              <Icon
                className={`w-6 h-6 ${isActive ? 'text-[#1877F2]' : 'text-[#050505]'
                  }`}
              />
              <span
                className={`text-sm ${isActive ? 'text-[#050505]' : 'text-[#050505]'
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
