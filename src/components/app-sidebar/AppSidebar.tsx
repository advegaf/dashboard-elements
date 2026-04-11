import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, Settings2 } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavMain, type NavMainItem } from './NavMain'
import { NavUser } from './NavUser'
import { LedgrMark, LedgrWordmark } from './LedgrLogo'

const navItems: NavMainItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Members',   url: '/members',   icon: Users,       disabled: true },
  { title: 'Billing',   url: '/billing',   icon: CreditCard,  disabled: true },
  { title: 'Settings',  url: '/settings',  icon: Settings2,   disabled: true },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="LEDGR">
              <Link to="/dashboard">
                <LedgrMark className="hidden size-6 shrink-0 group-data-[collapsible=icon]:block" />
                <LedgrWordmark className="block h-6 w-24 shrink-0 group-data-[collapsible=icon]:hidden" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
