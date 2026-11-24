import { useTranslation } from 'react-i18next'
import type { CategoryResponse, ProductCategory } from '@workspace/domain/schemas/product'
import { useRelatedProducts } from '../../hooks/use-products'
import { ProductCard } from '../product-card'

export interface DetailRelatedRailProps {
  currentId: string
  category?: ProductCategory | CategoryResponse | Pick<CategoryResponse, 'slug'>
  currentSlug?: string
  relatedSlugs?: string[]
  lang?: string
}

export function DetailRelatedRail({
  currentId,
  category,
}: DetailRelatedRailProps) {
  const { t } = useTranslation(['detail', 'common'])
  const categorySlug =
    typeof category === 'object' && category !== null
      ? category.slug
      : typeof category === 'string'
        ? category
        : undefined

  const { data: relatedProducts = [], isError } = useRelatedProducts(categorySlug, currentId)

  const validProducts = relatedProducts.filter((p) => p.id !== currentId)

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
        className="text-xl sm:text-2xl font-bold text-foreground"
      >
        {t('relatedProducts', { defaultValue: 'You May Also Like' })}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
