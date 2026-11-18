import { useTranslation } from 'react-i18next'
import { useProductCollection } from '../../products/hooks/use-product-collection'
import { ProductCard } from '../../products/components/product-card'
import { ProductCardSkeleton } from '../../products/components/product-card-skeleton'
import type { BundlesSectionConfig } from '../home.config'

export interface BundlesSectionProps {
  config: BundlesSectionConfig
  className?: string
}

export function BundlesSection({ config, className = '' }: BundlesSectionProps) {
  const { t } = useTranslation(['home', 'common'])
  const { data: products, isLoading } = useProductCollection({ collection: 'deals' })
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
            {t(config.titleKey as never, { ns: 'home', defaultValue: 'Bundles (Productivity-Led)' })}
          </h2>
          {config.subtitleKey && (
            <p className="text-sm text-muted-foreground">
              {t(config.subtitleKey as never, { ns: 'home' })}
            </p>
          )}
        </div>

        {/* Real Product Cards or Skeletons while loading */}
        {isLoading || !products || products.length === 0 ? (
          <div
            data-testid="bundles-skeleton"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[1, 2, 3].map((item) => (
              <ProductCardSkeleton key={item} />
            ))}
          </div>
        ) : (
          <div
            data-testid="bundles-content"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {products.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

