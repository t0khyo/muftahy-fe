import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Card } from '@workspace/ui/components/card'
import type { CategoryTilesSectionConfig, CategoryTileItem } from '../home.config'

export interface CategoryTilesProps {
  config: CategoryTilesSectionConfig
  className?: string
}

function CategoryIcon({ type }: { type: CategoryTileItem['icon'] }) {
  const iconProps = {
    className: 'h-6 w-6 text-foreground/80 group-hover:text-primary transition-colors',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.75',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (type) {
    case 'gamepad':
      return (
        <svg {...iconProps}>
          <line x1="6" x2="10" y1="12" y2="12" />
          <line x1="8" x2="8" y1="10" y2="14" />
          <line x1="15" x2="15.01" y1="13" y2="13" />
          <line x1="18" x2="18.01" y1="11" y2="11" />
          <rect width="20" height="12" x="2" y="6" rx="6" />
        </svg>
      )
    case 'app-window':
      return (
        <svg {...iconProps}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M10 4v4" />
          <path d="M2 8h20" />
          <path d="M6 4v4" />
        </svg>
      )
    case 'gift':
      return (
        <svg {...iconProps}>
          <rect x="3" y="8" width="18" height="4" rx="1" />
          <path d="M12 8v13" />
          <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
          <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
        </svg>
      )
    case 'credit-card':
      return (
        <svg {...iconProps}>
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      )
  }
}

export function CategoryTiles({ config, className = '' }: CategoryTilesProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const { t } = useTranslation(['home', 'common'])

  const headingId = `${config.id}-heading`

  return (
    <section
      id={config.id}
      aria-labelledby={headingId}
      className={`py-12 lg:py-20 ${className}`}
    >
      <div className="site-container space-y-6">
        <h2
          id={headingId}
          className="text-h4 font-bold tracking-tight text-foreground text-start"
        >
          {t('categories.title', { ns: 'home' })}
        </h2>

        {/* 2 columns mobile, 4 desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {config.items.map((item) => (
            <Link
              key={item.id}
              to={item.href.replace(':lang', currentLang)}
              className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
            >
              <Card className="h-full border border-border/60 bg-card hover:bg-accent/40 hover:border-foreground/20 rounded-2xl p-5 transition-all duration-200 shadow-none flex flex-col justify-between space-y-6 text-start">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-secondary/80 group-hover:bg-background transition-colors">
                    <CategoryIcon type={item.icon} />
                  </div>
                  {/* Direction-aware arrow that flips in RTL */}
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t(`categories.${item.labelKey}`, {
                      ns: 'home',
                      defaultValue: item.id,
                    })}
                  </h3>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

