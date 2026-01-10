import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { popularIcons, getIcon } from '../../utils/icons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
        {filteredIcons.length === 0 ? (
          <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
            No icons found
          </div>
        ) : (
          filteredIcons.map((iconName) => {
            const Icon = getIcon(iconName)
            const isSelected = selectedIcon === iconName

            return (
              <Button
                key={iconName}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="icon"
                onClick={() => onSelect(iconName)}
                aria-label={`Select ${iconName} icon`}
                title={iconName}
              >
                <Icon className="w-6 h-6" />
              </Button>
            )
          })
        )}
      </div>
    </div>
  )
}
