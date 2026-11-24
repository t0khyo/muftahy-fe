import { Link, useLocation, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Globe, Moon, Sun } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
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
    if (pathname.includes('/products')) return t('admin:nav.products', 'Products')
    if (pathname.includes('/orders')) return t('admin:nav.orders', 'Orders')
    if (pathname.includes('/inventory')) return t('admin:nav.inventory', 'Inventory')
    if (pathname.includes('/customers')) return t('admin:nav.customers', 'Customer Accounts')
    if (pathname.includes('/audit')) return t('admin:nav.audit', 'Audit Log')
    if (pathname.includes('/profile')) return t('admin:nav.profile', 'Profile')
    return t('admin:nav.dashboard', 'Dashboard')
  }

  const isSubPage = pathname !== `/${lang}` && pathname !== `/${lang}/`

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex w-full items-center gap-2">
        <SidebarTrigger className="-ms-1 size-8 transition-colors hover:bg-muted/60" aria-label={t('admin:sidebar.toggle')} />
        <Separator orientation="vertical" className="mx-1 h-4 bg-border/60" />

        <Breadcrumb>
          <BreadcrumbList className="text-xs sm:text-sm font-medium">
            {isSubPage ? (
              <>
                <BreadcrumbItem className="hidden sm:inline-flex">
                  <BreadcrumbLink
                    render={<Link to={`/${lang}`} />}
                    className="hover:text-foreground transition-colors text-muted-foreground"
                  >
                    {t('admin:nav.dashboard', 'Dashboard')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:inline-flex text-muted-foreground/40" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-foreground tracking-tight">
                    {getPageTitle()}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-foreground tracking-tight">
                  {t('admin:nav.dashboard', 'Dashboard')}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ms-auto flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="size-8 p-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {/* Language Switcher */}
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link to={`/${otherLang}`} />}
            className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="size-3.5" />
            <span>{otherLangLabel}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

