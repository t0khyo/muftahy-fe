import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import type { HowItWorksSectionConfig } from '../home.config'

export interface HowItWorksSectionProps {
  config: HowItWorksSectionConfig
  className?: string
}

export function HowItWorksSection({ config, className = '' }: HowItWorksSectionProps) {
  const { t } = useTranslation(['home', 'common'])
  const headingId = `${config.id}-heading`

  return (
    <section
      id={config.id}
      aria-labelledby={headingId}
      className={`py-12 lg:py-20 ${className}`}
    >
      <div className="mx-auto max-w-[var(--header-max-width,1024px)] px-4 lg:px-6 space-y-8">
        <div className="text-start space-y-2">
          <h2
            id={headingId}
            className="text-h4 font-bold tracking-tight text-foreground"
          >
            {t(config.titleKey as never, { ns: 'home', defaultValue: 'How It Works' })}
          </h2>
          {config.subtitleKey && (
            <p className="text-sm text-muted-foreground">
              {t(config.subtitleKey as never, { ns: 'home' })}
            </p>
          )}
        </div>

        {/* 3 Step Skeleton Cards */}
        <div
          data-testid="how-it-works-skeleton"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[1, 2, 3].map((step) => (
            <Card
              key={step}
              className="border border-border/60 bg-card rounded-2xl p-6 shadow-none flex flex-col justify-between space-y-6 text-start"
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="size-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs text-foreground">
                    0{step}
                  </div>
                  <Skeleton className="size-8 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-4/5 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

