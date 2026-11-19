import { Link, useLocation, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Globe, Moon, Sun, ShieldCheck } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Separator } from '@workspace/ui/components/separator'
import { SidebarTrigger } from '@workspace/ui/components/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'
import { useTheme } from '../../../app/theme-context'

export function SiteHeader() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { pathname } = useLocation()
  const { t } = useTranslation(['admin'])
  const { theme, setTheme } = useTheme()

  const otherLang = lang === 'ar' ? 'en' : 'ar'
  const otherLangLabel = lang === 'ar' ? 'English' : 'العربية'

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Derive current page label
  const getPageTitle = () => {
    if (pathname.includes('/products')) return t('admin:nav.products', 'Products & SKUs')
    if (pathname.includes('/orders')) return t('admin:nav.orders', 'Orders & Fulfillment')
    if (pathname.includes('/inventory')) return t('admin:nav.inventory', 'Key Pool Inventory')
    if (pathname.includes('/customers')) return t('admin:nav.customers', 'Customer Accounts')
    if (pathname.includes('/audit')) return t('admin:nav.audit', 'Security & Audit Log')
    return t('admin:nav.dashboard', 'Dashboard')
  }

  const isSubPage = pathname !== `/${lang}` && pathname !== `/${lang}/`

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur lg:px-6">
      <div className="flex w-full items-center gap-2">
        <SidebarTrigger className="-ms-1 size-8" aria-label={t('admin:sidebar.toggle')} />
        <Separator orientation="vertical" className="mx-1 h-4" />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink render={<Link to={`/${lang}`} />}>
                Muftahy
              </BreadcrumbLink>
            </BreadcrumbItem>
            {isSubPage && (
              <>
                <BreadcrumbSeparator className="hidden sm:inline-flex" />
                <BreadcrumbItem className="hidden sm:inline-flex">
                  <BreadcrumbLink render={<Link to={`/${lang}`} />}>
                    {t('admin:nav.dashboard', 'Dashboard')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator className="hidden sm:inline-flex" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground">
                {getPageTitle()}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ms-auto flex items-center gap-2">
          {/* Status Badge */}
          <Badge
            variant="outline"
            className="hidden sm:inline-flex gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]"
          >
            <ShieldCheck className="size-3.5" />
            <span>Gateway Online</span>
          </Badge>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="size-8 p-0"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {/* Language Switcher */}
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link to={`/${otherLang}`} />}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Globe className="size-3.5" />
            <span>{otherLangLabel}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

