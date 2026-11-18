import * as React from 'react'
import { useLocation, useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  PackageCheck,
  ShoppingCart,
  KeyRound,
  Users,
  ShieldAlert,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@workspace/ui/components/sidebar'
import { NavMain, type NavSection } from './nav-main'
import { NavUser } from './nav-user'

export function AppSidebar({
  side,
  dir,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { pathname } = useLocation()
  const { t } = useTranslation(['admin'])

  const isExactDashboard = pathname === `/${lang}` || pathname === `/${lang}/`

  const navSections: NavSection[] = [
    {
      label: t('admin:nav.workstations', 'Workstations'),
      items: [
        {
          title: t('admin:nav.dashboard', 'Dashboard'),
          url: `/${lang}`,
          icon: LayoutDashboard,
          isActive: isExactDashboard,
        },
        {
          title: t('admin:nav.products', 'Products & SKUs'),
          url: `/${lang}/products`,
          icon: PackageCheck,
          isActive: pathname.startsWith(`/${lang}/products`),
          badge: '184',
        },
        {
          title: t('admin:nav.orders', 'Orders & Fulfillment'),
          url: `/${lang}/orders`,
          icon: ShoppingCart,
          isActive: pathname.startsWith(`/${lang}/orders`),
          badge: '14',
        },
        {
          title: t('admin:nav.inventory', 'Key Pool Inventory'),
          url: `/${lang}/inventory`,
          icon: KeyRound,
          isActive: pathname.startsWith(`/${lang}/inventory`),
        },
        {
          title: t('admin:nav.customers', 'Customer Accounts'),
          url: `/${lang}/customers`,
          icon: Users,
          isActive: pathname.startsWith(`/${lang}/customers`),
        },
      ],
    },
    {
      label: t('admin:nav.system', 'System'),
      items: [
        {
          title: t('admin:nav.audit', 'Security & Audit Log'),
          url: `/${lang}/audit`,
          icon: ShieldAlert,
          isActive: pathname.startsWith(`/${lang}/audit`),
        },
      ],
    },
  ]

  return (
    <Sidebar collapsible="icon" side={side} dir={dir} {...props}>
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to={`/${lang}`} />}
              className="gap-3 hover:bg-sidebar-accent/50 cursor-pointer"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-xs">
                M
              </div>
              <div className="grid flex-1 text-start leading-tight">
                <span className="font-heading font-bold text-sm tracking-tight text-sidebar-foreground">
                  Muftahy Admin
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Operator Portal
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain sections={navSections} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <NavUser side={side} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

