import { useTranslation } from 'react-i18next'
import { useRelatedProducts } from '../../hooks/use-products'
import { ProductCard } from '../product-card'

export interface DetailRelatedRailProps {
  currentSlug: string
  relatedSlugs?: string[]
  lang?: string
}

export function DetailRelatedRail({
  currentSlug,
  relatedSlugs = [],
}: DetailRelatedRailProps) {
  const { t } = useTranslation(['detail', 'common'])
  const { data: relatedProducts = [], isError } = useRelatedProducts(relatedSlugs)

  // Filter out current product and verify non-empty
  const validProducts = relatedProducts.filter((p) => p.slug !== currentSlug)

  if (isError || validProducts.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby="heading-related-products"
      className="w-full border-t border-border/40 mt-16 sm:mt-20 pt-12 sm:pt-16 space-y-6 text-start"
    >
      <h2
        id="heading-related-products"
        className="font-heading text-xl sm:text-2xl font-semibold text-foreground"
      >
        {t('relatedProducts')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {validProducts.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  )
}
