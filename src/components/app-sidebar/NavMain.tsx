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
            const isActive =
              !item.disabled &&
              (location.pathname === item.url || location.pathname.startsWith(item.url + '/'))
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  {item.disabled ? (
                    <span
                      aria-disabled="true"
                      className="cursor-not-allowed opacity-50"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </span>
                  ) : (
                    <Link to={item.url}>
                      <Icon className="size-4 shrink-0" />
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
