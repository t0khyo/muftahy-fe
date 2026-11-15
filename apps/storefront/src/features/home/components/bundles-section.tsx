import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import type { BundlesSectionConfig } from '../home.config'

export interface BundlesSectionProps {
  config: BundlesSectionConfig
  className?: string
}

export function BundlesSection({ config, className = '' }: BundlesSectionProps) {
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
            {t(config.titleKey as never, { ns: 'home', defaultValue: 'Bundles (Productivity-Led)' })}
          </h2>
          {config.subtitleKey && (
            <p className="text-sm text-muted-foreground">
              {t(config.subtitleKey as never, { ns: 'home' })}
            </p>
          )}
        </div>

        {/* 3 Bundle Skeleton Cards */}
        <div
          data-testid="bundles-skeleton"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[1, 2, 3].map((item) => (
            <Card
              key={item}
              className="overflow-hidden border border-border/60 bg-card rounded-2xl shadow-none"
            >
              <div className="aspect-16/9 w-full bg-muted p-4 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-4/5 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-border/40">
                  <Skeleton className="h-6 w-24 rounded" />
                  <Skeleton className="h-9 w-28 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

