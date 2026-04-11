import { Link } from 'react-router-dom'
import {
  DashboardSquare01Icon,
  UserMultipleIcon,
  CreditCardIcon,
  Settings02Icon,
} from '@hugeicons/core-free-icons'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavMain, type NavMainGroup } from './NavMain'
import { NavUser } from './NavUser'
import { LedgrMark, LedgrWordmark } from './LedgrLogo'

const navGroups: NavMainGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: DashboardSquare01Icon },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { title: 'Members', url: '/members', icon: UserMultipleIcon, disabled: true, comingSoon: true },
      { title: 'Billing', url: '/billing', icon: CreditCardIcon,   disabled: true, comingSoon: true },
    ],
  },
  {
    label: 'Account',
    items: [
      { title: 'Settings', url: '/settings', icon: Settings02Icon, disabled: true, comingSoon: true },
    ],
  },
]

export function AppSidebar() {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-14 flex-row items-center px-4 py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <Link
          to="/dashboard"
          aria-label="LEDGR"
          className="flex items-center rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <LedgrMark className="hidden size-8 shrink-0 group-data-[collapsible=icon]:block" />
          <LedgrWordmark className="block h-8 w-32 shrink-0 group-data-[collapsible=icon]:hidden" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
