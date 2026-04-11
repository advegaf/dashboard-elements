import { Link, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export interface NavMainItem {
  title: string
  url: string
  icon: LucideIcon
  disabled?: boolean
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/')
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild={!item.disabled}
                  isActive={isActive}
                  tooltip={item.title}
                  disabled={item.disabled}
                >
                  {item.disabled ? (
                    <span>
                      <item.icon />
                      <span>{item.title}</span>
                    </span>
                  ) : (
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
