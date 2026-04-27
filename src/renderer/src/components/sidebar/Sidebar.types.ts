export interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
  color: string
}

export interface SidebarProps {
  currentTab: string
  onTabChange: (tabId: string) => void
}