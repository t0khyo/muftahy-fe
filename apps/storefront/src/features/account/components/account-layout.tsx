import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useParams } from 'react-router'
import { User, ShoppingBag, KeyRound, LifeBuoy, LogOut } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
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
    <div className="container mx-auto px-4 py-8">
      {/* Header welcome banner */}
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {t('welcome', { name: user?.full_name || user?.email || '' })}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('title')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-1 space-y-1">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to.endsWith('/profile')}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}

            <div className="pt-4 mt-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3.5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>{t('nav.logout')}</span>
              </Button>
            </div>
          </nav>
        </aside>

        {/* Content Outlet */}
        <main className="md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
