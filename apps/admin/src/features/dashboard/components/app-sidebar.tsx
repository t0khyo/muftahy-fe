import * as React from 'react'
import { useLocation, useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  PackageCheck,
  ShoppingCart,
  KeyRound,
  LifeBuoy,
  Tag,
  BookOpen,
  ShieldAlert,
  FolderTree,
  Settings,
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
  useSidebar,
} from '@workspace/ui/components/sidebar'
import { NavMain, type NavSection } from './nav-main'
import { NavUser } from './nav-user'
import { useDashboardOverview } from '../hooks/use-admin-dashboard'
import { BrandLogoMark } from '../../../components/brand-logo'

export function AppSidebar({
  side,
  dir,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { pathname } = useLocation()
  const { t } = useTranslation(['admin'])
  const { isMobile, setOpenMobile } = useSidebar()
  const { data: overview } = useDashboardOverview()

  const handleHeaderNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const isExactDashboard = pathname === `/${lang}` || pathname === `/${lang}/`

  const pendingOrders = overview?.pending_orders_count
  const openTickets = overview?.open_tickets_count
  const lowStockCount = overview?.low_stock_products?.length

  const navSections: NavSection[] = [
    {
      label: t('admin:nav.overview', 'Overview'),
      items: [
        {
          title: t('admin:nav.dashboard', 'Dashboard'),
          url: `/${lang}`,
          icon: LayoutDashboard,
          isActive: isExactDashboard,
        },
      ],
    },
    {
      label: t('admin:nav.store', 'Store'),
      items: [
        {
          title: t('admin:nav.orders', 'Orders'),
          url: `/${lang}/orders`,
          icon: ShoppingCart,
          isActive: pathname.startsWith(`/${lang}/orders`),
          badge: pendingOrders && pendingOrders > 0 ? String(pendingOrders) : undefined,
        },
        {
          title: t('admin:nav.products', 'Products'),
          url: `/${lang}/products`,
          icon: PackageCheck,
          isActive: pathname.startsWith(`/${lang}/products`),
        },
        {
          title: t('admin:categories.title', 'Categories'),
          url: `/${lang}/categories`,
          icon: FolderTree,
          isActive: pathname.startsWith(`/${lang}/categories`),
        },
        {
          title: t('admin:nav.inventory', 'Inventory'),
          url: `/${lang}/inventory`,
          icon: KeyRound,
          isActive: pathname.startsWith(`/${lang}/inventory`),
          badge: lowStockCount && lowStockCount > 0 ? t('admin:nav.lowStockBadge', 'Low') : undefined,
        },
        {
          title: t('admin:nav.discounts', 'Discounts'),
          url: `/${lang}/promos`,
          icon: Tag,
          isActive: pathname.startsWith(`/${lang}/promos`),
        },
      ],
    },
    {
      label: t('admin:nav.operations', 'Operations'),
      items: [
        {
          title: t('admin:nav.support', 'Customer Support'),
          url: `/${lang}/tickets`,
          icon: LifeBuoy,
          isActive: pathname.startsWith(`/${lang}/tickets`),
          badge: openTickets && openTickets > 0 ? String(openTickets) : undefined,
        },
        {
          title: t('admin:nav.finance', 'Finance'),
          url: `/${lang}/ledger`,
          icon: BookOpen,
          isActive: pathname.startsWith(`/${lang}/ledger`),
        },
        {
          title: t('admin:nav.audit', 'Audit Log'),
          url: `/${lang}/audit`,
          icon: ShieldAlert,
          isActive: pathname.startsWith(`/${lang}/audit`),
        },
        {
          title: t('admin:nav.settings', 'Store Settings'),
          url: `/${lang}/settings`,
          icon: Settings,
          isActive: pathname.startsWith(`/${lang}/settings`),
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
              render={<Link to={`/${lang}`} onClick={handleHeaderNavClick} />}
              className="gap-3 hover:bg-sidebar-accent/50 cursor-pointer"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 p-1 shadow-xs">
                <BrandLogoMark className="size-6 shrink-0" idPrefix="admin-sidebar-logo" />
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
