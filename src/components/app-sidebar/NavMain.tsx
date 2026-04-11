import { Link, useLocation } from 'react-router-dom'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export interface NavMainItem {
  title: string
  url: string
  icon: IconSvgElement
  disabled?: boolean
  comingSoon?: boolean
}

export interface NavMainGroup {
  label: string
  items: NavMainItem[]
}

export function NavMain({ groups }: { groups: NavMainGroup[] }) {
  const location = useLocation()

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  !item.disabled &&
                  (location.pathname === item.url ||
                    location.pathname.startsWith(item.url + '/'))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      {item.disabled ? (
                        <span
                          aria-disabled="true"
                          className="cursor-not-allowed opacity-50"
                        >
                          <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </span>
                      ) : (
                        <Link to={item.url}>
                          <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                    {item.comingSoon && (
                      <SidebarMenuBadge className="text-[10px] uppercase tracking-wide text-sidebar-foreground/60">
                        Soon
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
