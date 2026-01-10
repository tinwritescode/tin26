import { UserPlus } from 'lucide-react'

interface Suggestion {
  id: string
  name: string
  mutual: number
  avatar: string
}

const mockSuggestions: Suggestion[] = [
  { id: '1', name: 'John Doe', mutual: 5, avatar: 'JD' },
  { id: '2', name: 'Jane Smith', mutual: 12, avatar: 'JS' },
  { id: '3', name: 'Bob Wilson', mutual: 3, avatar: 'BW' },
  { id: '4', name: 'Alice Brown', mutual: 8, avatar: 'AB' },
  { id: '5', name: 'Charlie Davis', mutual: 15, avatar: 'CD' },
]

export function RightSidebar() {
  return (
    <aside className="hidden xl:block w-80 pt-4">
      <div className="space-y-4">
        {/* Contacts */}
        <div>
          <h3 className="text-sm font-semibold text-[#65676B] mb-3 px-2">
            Contacts
          </h3>
          <div className="space-y-1">
            {mockSuggestions.slice(0, 5).map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#F0F2F5] transition-colors duration-200 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-xs font-semibold">
                  {contact.avatar}
                </div>
                <span className="text-sm text-[#050505]">{contact.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Friend Suggestions */}
        <div>
          <h3 className="text-sm font-semibold text-[#65676B] mb-3 px-2">
            Friend Suggestions
          </h3>
          <div className="space-y-3">
            {mockSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-[#F0F2F5] transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-sm font-semibold">
                    {suggestion.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#050505]">
                      {suggestion.name}
                    </div>
                    <div className="text-xs text-[#65676B]">
                      {suggestion.mutual} mutual friends
                    </div>
                  </div>
                </div>
                <button className="p-1.5 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] transition-colors duration-200 cursor-pointer">
                  <UserPlus className="w-4 h-4 text-[#050505]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
