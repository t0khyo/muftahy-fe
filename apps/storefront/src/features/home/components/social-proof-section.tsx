import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import type { SocialProofSectionConfig } from '../home.config'

export interface SocialProofSectionProps {
  config: SocialProofSectionConfig
  className?: string
}

export function SocialProofSection({ config, className = '' }: SocialProofSectionProps) {
  const { t } = useTranslation(['home', 'common'])
  const headingId = `${config.id}-heading`

  return (
    <section
      id={config.id}
      aria-labelledby={headingId}
      className={`py-12 lg:py-20 ${className}`}
    >
      <div className="site-container space-y-8">
        <div className="text-start space-y-2">
          <h2
            id={headingId}
            className="text-h4 font-bold tracking-tight text-foreground"
          >
            {t(config.titleKey as never, { ns: 'home', defaultValue: 'Social Proof' })}
          </h2>
          {config.subtitleKey && (
            <p className="text-sm text-muted-foreground">
              {t(config.subtitleKey as never, { ns: 'home' })}
            </p>
          )}
        </div>

        {/* 3 Testimonial Skeleton Cards */}
        <div
          data-testid="social-proof-skeleton"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[1, 2, 3].map((item) => (
            <Card
              key={item}
              className="border border-border/60 bg-card rounded-2xl p-6 shadow-none flex flex-col justify-between space-y-6 text-start"
            >
              <CardContent className="p-0 space-y-4">
                {/* 5 star rating skeleton */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Skeleton key={star} className="size-4 rounded-sm" />
                  ))}
                </div>
                {/* Review quote skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-11/12 rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                </div>
                {/* User avatar and info skeleton */}
                <div className="pt-2 flex items-center gap-3 border-t border-border/40">
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

