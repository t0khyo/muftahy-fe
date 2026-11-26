import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import heroBanner from '../../../assets/hero-banner.webp'
import {
  DEFAULT_HERO_TRUST_CLAIMS,
  type HeroSectionConfig,
} from '../home.config'
import { resolveLocaleHref } from '../lib/resolve-locale-href'
import {
  ChevronEndIcon,
  HeadphonesIcon,
  ShieldCheckIcon,
  ZapIcon,
} from './hero-icons'

export interface HeroSectionProps {
  config: HeroSectionConfig
  className?: string
}

const ICON_MAP = {
  zap: ZapIcon,
  'shield-check': ShieldCheckIcon,
  headphones: HeadphonesIcon,
} as const

export function HeroSection({ config, className = '' }: HeroSectionProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const { t, i18n } = useTranslation(['home', 'common'])

  const headingId = `${config.id}-heading`

  const hasBadge = Boolean(
    config.badgeKey &&
      i18n.exists(`home:${config.badgeKey}`, {
        lng: currentLang,
      }),
  )

  const trustClaims = config.trustClaims ?? DEFAULT_HERO_TRUST_CLAIMS

  return (
    <section
      id={config.id}
      aria-labelledby={headingId}
      className={`py-12 lg:py-20 text-center ${className}`}
    >
      <div className="site-container space-y-8">
        {/* Optional Announcement Pill */}
        {hasBadge && (
          <div className="flex justify-center">
            {config.badgeHref ? (
              <div className="min-h-11 inline-flex items-center">
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1 text-xs font-medium cursor-pointer transition-colors hover:bg-secondary/80"
                  render={
                    <Link
                      to={resolveLocaleHref(config.badgeHref, currentLang)}
                    />
                  }
                >
                  {t(config.badgeKey as never, { ns: 'home' })}
                  <ChevronEndIcon className="size-3 rtl:rotate-180" />
                </Badge>
              </div>
            ) : (
              <Badge
                variant="secondary"
                role="status"
                className="gap-1.5 px-3 py-1 text-xs font-medium"
              >
                {t(config.badgeKey as never, { ns: 'home' })}
              </Badge>
            )}
          </div>
        )}

        {/* Typographic Core (capped ~720px for optimal reading measure) */}
        <div className="space-y-4 max-w-[720px] mx-auto">
          {/* Exactly one h1 on the page */}
          <h1
            id={headingId}
            className="text-h1 font-bold text-foreground ltr:tracking-tight text-balance"
          >
            {t('hero.title', { ns: 'home' })}
          </h1>
          <p className="text-body text-muted-foreground text-balance max-w-[640px] mx-auto">
            {t('hero.subtitle', { ns: 'home' })}
          </p>
        </div>

        {/* Action Controls: ONE primary button + ONE quiet text link */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            size="lg"
            variant="default"
            nativeButton={false}
            className="rounded-full px-8 font-semibold cursor-pointer shadow-sm transition-transform active:scale-98"
            render={
              <Link
                to={resolveLocaleHref(config.primaryCtaHref, currentLang)}
              />
            }
          >
            {t('hero.primaryCta', { ns: 'home' })}
          </Button>
          <Link
            to={resolveLocaleHref(config.secondaryCtaHref, currentLang)}
            className="min-h-11 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors px-3"
          >
            {t('hero.secondaryCta', { ns: 'home' })}
          </Link>
        </div>

        {/* Trust Claims Row */}
        {trustClaims.length > 0 && (
          <ul
            role="list"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2"
          >
            {trustClaims.map((claim) => {
              const IconComponent = ICON_MAP[claim.icon]
              return (
                <li
                  key={claim.id}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                >
                  {IconComponent && (
                    <IconComponent className="size-3.5 text-muted-foreground/80" />
                  )}
                  <span>{t(claim.labelKey as never, { ns: 'home' })}</span>
                </li>
              )
            })}
          </ul>
        )}

        {/* Hero Visual Banner */}
        <div className="pt-4 flex justify-center">
          <div
            data-testid="hero-visual"
            className="w-full overflow-hidden rounded-3xl border border-border/50 bg-muted/40 shadow-sm"
          >
            <img
              src={heroBanner}
              alt={t('hero.visualAlt', { ns: 'home' })}
              width={1024}
              height={571}
              className="w-full h-auto block object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
