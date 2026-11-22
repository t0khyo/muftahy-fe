import * as React from 'react'
import { Link } from 'react-router'
import { type LucideIcon } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@workspace/ui/components/sidebar'

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  badge?: string
}

export interface NavSection {
  label?: string
  items: NavItem[]
}

export function NavMain({ sections }: { sections: NavSection[] }) {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <>
      {sections.map((section, idx) => (
        <React.Fragment key={section.label || `section-${idx}`}>
          {idx > 0 && <SidebarSeparator className="my-1 opacity-50" />}
          <SidebarGroup>
            {section.label && (
              <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link to={item.url} onClick={handleNavClick} />}
                      isActive={item.isActive}
                      tooltip={item.title}
                      className="gap-2.5 font-medium cursor-pointer"
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="font-mono text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-1.5 h-4.5 min-w-4.5">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </React.Fragment>
      ))}
    </>
  )
}

