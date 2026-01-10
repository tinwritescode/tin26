import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { popularIcons, getIcon } from '../../utils/icons'

interface IconPickerProps {
  selectedIcon: string
  onSelect: (iconName: string) => void
}

export function IconPicker({ selectedIcon, onSelect }: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredIcons = popularIcons.filter((iconName) =>
    iconName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-1">
        {filteredIcons.length === 0 ? (
          <div className="col-span-full text-center py-8 text-sm text-slate-500">
            No icons found
          </div>
        ) : (
          filteredIcons.map((iconName) => {
            const Icon = getIcon(iconName)
            const isSelected = selectedIcon === iconName

            return (
              <button
                key={iconName}
                onClick={() => onSelect(iconName)}
                className={`p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                aria-label={`Select ${iconName} icon`}
                title={iconName}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isSelected ? 'text-blue-600' : 'text-slate-600'
                  }`}
                />
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
