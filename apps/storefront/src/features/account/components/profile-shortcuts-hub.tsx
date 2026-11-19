import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, KeyRound, LifeBuoy, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@workspace/ui/components/card'

export function ProfileShortcutsHub() {
  const { t } = useTranslation('account')
  const { lang = 'ar' } = useParams<{ lang: string }>()

  const shortcuts = [
    {
      to: `/${lang}/account/orders`,
      title: t('profile.viewOrders'),
      description: t('profile.ordersDesc'),
      icon: ShoppingBag,
      tag: 'Orders',
    },
    {
      to: `/${lang}/account/keys`,
      title: t('profile.viewKeys'),
      description: t('profile.keysDesc'),
      icon: KeyRound,
      tag: 'Licenses',
    },
    {
      to: `/${lang}/account/support`,
      title: t('profile.viewSupport'),
      description: t('profile.supportDesc'),
      icon: LifeBuoy,
      tag: 'Helpdesk',
    },
  ]

  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <h3 className="text-sm font-bold tracking-tight text-foreground">
          {t('profile.shortcutsTitle')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('profile.shortcutsDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon
          return (
            <Link
              key={shortcut.to}
              to={shortcut.to}
              className="group block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
            >
              <Card className="h-full border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon className="size-4.5" />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:text-primary group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {shortcut.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {shortcut.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
