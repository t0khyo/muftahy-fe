import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowRight, KeyRound, LifeBuoy, ShoppingBag } from 'lucide-react'
import { isSupportedLanguage, type SupportedLanguage } from '@workspace/i18n/config'
import { Button } from '@workspace/ui/components/button'

export function AdminNotFoundPage() {
  const { lang } = useParams<{ lang: string }>()
  const { t, i18n } = useTranslation('notFound')
  const currentLang: SupportedLanguage =
    lang && isSupportedLanguage(lang)
      ? lang
      : isSupportedLanguage(i18n.language)
        ? i18n.language
        : 'ar'

  const quickLinks = [
    {
      key: 'orders',
      to: `/${currentLang}/orders`,
      icon: ShoppingBag,
      title: t('admin.links.orders.title'),
      description: t('admin.links.orders.description'),
    },
    {
      key: 'inventory',
      to: `/${currentLang}/inventory`,
      icon: KeyRound,
      title: t('admin.links.inventory.title'),
      description: t('admin.links.inventory.description'),
    },
    {
      key: 'tickets',
      to: `/${currentLang}/tickets`,
      icon: LifeBuoy,
      title: t('admin.links.tickets.title'),
      description: t('admin.links.tickets.description'),
    },
  ] as const

  return (
    <section
      aria-labelledby="admin-not-found-heading"
      className="flex min-h-[calc(100svh-4rem)] w-full flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="auth-enter motion-reduce:animate-none w-full max-w-2xl text-center space-y-10">
        <div className="space-y-4">
          <p
            dir="ltr"
            className="text-6xl sm:text-7xl font-bold tracking-tight tabular-nums text-muted-foreground/35 select-none"
            aria-hidden="true"
          >
            {t('code')}
          </p>
          <h1
            id="admin-not-found-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
          >
            {t('admin.title')}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
            {t('admin.description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link to={`/${currentLang}`} />}
            className="w-full sm:w-auto rounded-full px-6"
          >
            {t('admin.primaryCta')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link to={`/${currentLang}/products`} />}
            className="w-full sm:w-auto rounded-full px-6"
          >
            {t('admin.secondaryCta')}
          </Button>
        </div>

        <div className="pt-4 space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('admin.quickLinksTitle')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className="group flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-5 text-start transition-transform duration-200 hover:-translate-y-0.5 hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <ArrowRight
                      className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

