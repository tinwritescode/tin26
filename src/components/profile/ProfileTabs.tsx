import { Tabs, TabsList, TabsTab, TabsPanel } from '../ui/tabs'

interface ProfileTabsProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  children?: React.ReactNode
}

export function ProfileTabs({
  activeTab = 'about',
  onTabChange,
  children,
}: ProfileTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="w-full"
    >
      <TabsList variant="underline" className="w-full justify-start border-b">
        <TabsTab value="about">About</TabsTab>
        <TabsTab value="posts">Posts</TabsTab>
        <TabsTab value="photos">Photos</TabsTab>
      </TabsList>
      {children}
    </Tabs>
  )
}
