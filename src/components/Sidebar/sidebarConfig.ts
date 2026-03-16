import {
  LayoutPanelTopIcon,
  UsersIcon,
  CalendarDaysIcon,
  DollarSignIcon,
  FileTextIcon,
  MessageCircleMoreIcon,
  CircleHelpIcon,
  SettingsIcon,
} from 'lucide-animated'

export type AnimatedIconHandle = {
  startAnimation(): void
  stopAnimation(): void
}

export interface NavItem {
  id: string
  label: string
  icon?: React.ForwardRefExoticComponent<any>
  badge?: number
}

export interface NavSection {
  id: string
  title: string
  items: NavItem[]
  collapsible?: boolean
}

export interface SidebarProps {
  activeItem: string
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'operations',
    title: 'Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutPanelTopIcon },
      { id: 'members', label: 'Members', icon: UsersIcon },
      { id: 'classes', label: 'Classes', icon: CalendarDaysIcon },
    ],
  },
  {
    id: 'intelligence',
    title: 'Intelligence',
    collapsible: true,
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'retention', label: 'Retention', badge: 12 },
      { id: 'churn-risk', label: 'Churn Risk', badge: 8 },
      { id: 'engagement', label: 'Engagement', badge: 24 },
      { id: 'growth', label: 'Growth', badge: 3 },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    items: [
      { id: 'payments', label: 'Payments', icon: DollarSignIcon },
      { id: 'reports', label: 'Reports', icon: FileTextIcon },
    ],
  },
]

export const FOOTER_ITEMS: NavItem[] = [
  { id: 'communication', label: 'Communication', icon: MessageCircleMoreIcon, badge: 3 },
  { id: 'support', label: 'Support', icon: CircleHelpIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export const USER_PROFILE = {
  name: 'Angel Vega',
  email: 'admin@ledgrbilling.com',
}
