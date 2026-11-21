import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useParams } from 'react-router'
import { User, ShoppingBag, KeyRound, LifeBuoy, LogOut, ShieldCheck } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Blobatar } from '@workspace/ui/components/blobatar'
import { useAuth } from '../../auth/hooks/use-auth'

export function AccountLayout() {
  const { t } = useTranslation('account')
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const { user, logout } = useAuth()

  const navItems = [
    {
      to: `/${lang}/account/profile`,
      label: t('nav.profile'),
      icon: User,
    },
    {
      to: `/${lang}/account/orders`,
      label: t('nav.orders'),
      icon: ShoppingBag,
    },
    {
      to: `/${lang}/account/keys`,
      label: t('nav.keys'),
      icon: KeyRound,
    },
    {
      to: `/${lang}/account/support`,
      label: t('nav.support'),
      icon: LifeBuoy,
    },
  ]

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Header welcome banner with account tier badge & Blobatar */}
      <div className="mb-6 md:mb-8 border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <Blobatar
            name={user?.full_name || user?.email || 'Customer'}
            className="size-11 sm:size-12 shrink-0 border border-border shadow-xs"
            blobatar={{
              animate: 'hover',
            }}
          />
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground truncate">
                {t('welcome', { name: user?.full_name || user?.email || '' })}
              </h1>
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 bg-primary/5 text-primary text-xs font-medium"
              >
                <ShieldCheck className="size-3.5" />
                <span>{t('profile.accountTier', 'Verified Customer')}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{t('title')}</p>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Sticky Segmented Chip-bar */}
      <div className="md:hidden sticky top-14 z-20 -mx-4 px-4 bg-background/95 backdrop-blur-md border-b border-border mb-6 py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.endsWith('/profile')}
              className={({ isActive }) =>
                cn(
                  'inline-flex shrink-0 items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.98]',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar (Desktop) */}
        <aside className="hidden md:block md:col-span-1 space-y-1">
          <nav className="flex flex-col space-y-1 rounded-2xl border border-border/70 bg-card/60 p-2 shadow-2xs">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to.endsWith('/profile')}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    )
                  }
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}

            <div className="pt-2 mt-2 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] transition-all"
                onClick={() => logout()}
              >
                <LogOut className="size-4 shrink-0" />
                <span>{t('nav.logout')}</span>
              </Button>
            </div>
          </nav>
        </aside>

        {/* Content Outlet */}
        <main className="md:col-span-3 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
