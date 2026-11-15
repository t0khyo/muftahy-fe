import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import type { PlatformStripSectionConfig } from '../home.config'

export interface PlatformStripProps {
  config: PlatformStripSectionConfig
  className?: string
}

export function PlatformStrip({ config, className = '' }: PlatformStripProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const { t } = useTranslation(['home', 'common'])

  const headingId = `${config.id}-heading`

  return (
    <section
      id={config.id}
      aria-labelledby={headingId}
      className={`py-8 lg:py-12 ${className}`}
    >
      <div className="mx-auto max-w-[var(--header-max-width,1024px)] px-4 lg:px-6 space-y-4">
        <h2
          id={headingId}
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start"
        >
          {t('platforms.title', { ns: 'home', defaultValue: 'Supported Platforms' })}
        </h2>

        {/* Text pills, wraps on mobile */}
        <div className="flex flex-wrap items-center gap-2.5">
          {config.items.map((pill) => (
            <Link
              key={pill.id}
              to={pill.href.replace(':lang', currentLang)}
              className="inline-flex items-center rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:border-foreground/30 hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {pill.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

