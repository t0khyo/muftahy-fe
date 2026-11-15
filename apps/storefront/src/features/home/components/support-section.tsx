import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import type { SupportSectionConfig } from '../home.config'

export interface SupportSectionProps {
  config: SupportSectionConfig
  className?: string
}

export function SupportSection({ config, className = '' }: SupportSectionProps) {
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
            {t(config.titleKey as never, { ns: 'home', defaultValue: 'Support' })}
          </h2>
          {config.subtitleKey && (
            <p className="text-sm text-muted-foreground">
              {t(config.subtitleKey as never, { ns: 'home' })}
            </p>
          )}
        </div>

        {/* 2 Support Channel Skeleton Cards */}
        <div
          data-testid="support-skeleton"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {[1, 2].map((item) => (
            <Card
              key={item}
              className="border border-border/60 bg-card rounded-2xl p-6 shadow-none flex flex-col justify-between space-y-6 text-start"
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3.5 w-48 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                </div>
                <div className="pt-2">
                  <Skeleton className="h-10 w-36 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

