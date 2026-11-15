import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@workspace/ui/components/button'
import type { ProductCollection } from '@workspace/domain/schemas/product'
import { useProductCollection } from '../hooks/use-product-collection'
import { ProductCardPlaceholder } from './product-card-placeholder'
import { ProductRailSkeleton } from './product-rail-skeleton'

export interface ProductRailProps {
  id: string
  collection: ProductCollection
  titleKey: string
  viewAllHref: string
  className?: string
}

export function ProductRail({
  id,
  collection,
  titleKey,
  viewAllHref,
  className = '',
}: ProductRailProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const { t } = useTranslation(['home', 'common'])

  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useProductCollection({ collection })

  const headingId = `${id}-heading`

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`py-12 lg:py-20 ${className}`}
    >
      <div className="mx-auto max-w-[var(--header-max-width,1024px)] px-4 lg:px-6">
        {/* Rail Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id={headingId}
            className="text-h4 font-bold tracking-tight text-foreground text-start"
          >
            {t(`rails.${titleKey}`, { ns: 'home', defaultValue: titleKey })}
          </h2>
          <Link
            to={viewAllHref.replace(':lang', currentLang)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group inline-flex items-center gap-1"
          >
            <span>{t('rails.viewAll', { ns: 'home', defaultValue: 'View all' })}</span>
            <svg
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>

        {/* Rail Content: Loading / Error / Empty / Loaded */}
        {isLoading ? (
          <div aria-busy="true">
            <ProductRailSkeleton />
          </div>
        ) : isError ? (
          <div
            data-testid={`rail-error-${id}`}
            className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3"
          >
            <p className="text-sm text-destructive">
              {t('rails.error', {
                ns: 'home',
                defaultValue: 'Unable to load products. Please try again.',
              })}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="cursor-pointer"
            >
              {t('rails.retry', { ns: 'home', defaultValue: 'Try again' })}
            </Button>
          </div>
        ) : !products || products.length === 0 ? (
          <div
            data-testid={`rail-empty-${id}`}
            className="rounded-2xl border border-border/40 bg-card p-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              {t('rails.empty', {
                ns: 'home',
                defaultValue: 'No products currently available in this section.',
              })}
            </p>
          </div>
        ) : (
          <div
            data-testid={`rail-content-${id}`}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 text-start"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[calc(43.5%-12px)] sm:w-[calc(33.333%-12px)] lg:w-[calc(20%-13px)] shrink-0 snap-start"
              >
                <ProductCardPlaceholder product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

