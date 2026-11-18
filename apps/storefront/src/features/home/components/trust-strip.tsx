// NOTICE: Trust strip copy contains neutral placeholders.
// All claims and operational promises must be verified with legal/ops before production launch.

import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@workspace/ui/components/card'
import type { TrustStripSectionConfig, TrustItem } from '../home.config'

export interface TrustStripProps {
  config: TrustStripSectionConfig
  className?: string
}

function TrustIcon({ type }: { type: TrustItem['icon'] }) {
  const iconProps = {
    className: 'h-5 w-5 text-primary',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.75',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (type) {
    case 'zap':
      return (
        <svg {...iconProps}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    case 'shield-check':
      return (
        <svg {...iconProps}>
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    case 'headphones':
      return (
        <svg {...iconProps}>
          <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
        </svg>
      )
    case 'globe':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      )
  }
}

export function TrustStrip({ config, className = '' }: TrustStripProps) {
  const { t } = useTranslation(['home', 'common'])
  const headingId = `${config.id}-heading`

  return (
    <section
      id={config.id}
      aria-labelledby={headingId}
      className={`py-12 lg:py-20 ${className}`}
    >
      <div className="site-container space-y-8">
        <h2
          id={headingId}
          className="text-h4 font-bold tracking-tight text-foreground text-start"
        >
          {t('trust.title', { ns: 'home', defaultValue: 'Why Choose Muftahy' })}
        </h2>

        {/* 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {config.items.map((item) => (
            <Card
              key={item.id}
              className="border border-border/50 bg-card rounded-2xl shadow-none p-4 sm:p-5 flex flex-col justify-start text-start space-y-3"
            >
              <CardContent className="p-0 space-y-2.5">
                <div className="p-2 w-fit rounded-lg bg-secondary/80">
                  <TrustIcon type={item.icon} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t(`trust.${item.titleKey}`, { ns: 'home', defaultValue: item.id })}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(`trust.${item.descKey}`, {
                    ns: 'home',
                    defaultValue: 'Placeholder description.',
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

