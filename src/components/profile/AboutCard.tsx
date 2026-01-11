import { MapPin, Briefcase, GraduationCap, Mail, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardPanel } from '../ui/card'
// Simple date formatting without date-fns
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

interface AboutCardProps {
  user: {
    bio?: string | null
    location?: string | null
    work?: string | null
    education?: string | null
    email?: string | null
    createdAt?: Date | string | null
  }
}

export function AboutCard({ user }: AboutCardProps) {
  const sections = [
    {
      title: 'Overview',
      items: [
        user.bio && { label: 'Bio', value: user.bio },
        user.location && {
          label: 'Location',
          value: user.location,
          icon: MapPin,
        },
        user.work && {
          label: 'Work',
          value: user.work,
          icon: Briefcase,
        },
        user.education && {
          label: 'Education',
          value: user.education,
          icon: GraduationCap,
        },
        user.email && {
          label: 'Email',
          value: user.email,
          icon: Mail,
        },
        user.createdAt && {
          label: 'Joined',
          value: formatDate(user.createdAt),
          icon: Calendar,
        },
      ].filter(Boolean),
    },
  ]

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardPanel>
            <div className="space-y-4">
              {section.items.map((item: any, itemIdx: number) => {
                const Icon = item.icon
                return (
                  <div key={itemIdx} className="flex gap-3">
                    {Icon && (
                      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground mb-0.5">
                        {item.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.value}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardPanel>
        </Card>
      ))}
    </div>
  )
}
