import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { Box } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { formatMoney } from '@workspace/domain/formatters/money'
import { formatNumber } from '@workspace/domain/formatters/number'
import type { ProductResponse } from '@workspace/domain/schemas/product'
import { getProductThumbnailUrl } from '@workspace/api/factory'
import { useAddToCart } from '../../cart/hooks/use-cart'
import { AddToCartButton } from './add-to-cart-button'

export interface ProductCardProps {
  product: ProductResponse
  locale?: string
  priority?: boolean
  className?: string
  onAddToCart?: (product: ProductResponse) => void
}

export function ProductCard({
  product,
  locale,
  className,
  onAddToCart,
}: ProductCardProps) {
  const { lang } = useParams<{ lang: string }>()
  const { t, i18n } = useTranslation(['products', 'common'])
  const currentLang = locale ?? (lang === 'ar' || (!lang && i18n.language === 'ar') ? 'ar' : 'en')
  const [failedUrl, setFailedUrl] = React.useState<string | null>(null)

  const isPreorder = product.stock_status === 'preorder'
  const isOutOfStock = product.stock_status === 'out_of_stock'

  const formattedEffectivePrice = formatMoney(Number(product.effective_price), {
    currency: 'EGP',
    locale: currentLang,
  })

  const formattedBasePrice = product.sale_price
    ? formatMoney(Number(product.base_price), {
        currency: 'EGP',
        locale: currentLang,
      })
    : null

  const coverImageUrl = getProductThumbnailUrl(product)
  const imageFailed = Boolean(coverImageUrl && failedUrl === coverImageUrl)

  const { mutate: addToCart } = useAddToCart()

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product)
      return
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      unitPrice: Number(product.effective_price),
      isPreorder,
      quantity: 1,
      slug: product.slug,
      coverImage: coverImageUrl ?? undefined,
      category: product.category?.slug,
      variant: product.variant ?? undefined,
    })
  }

  const addToCartLabel = isOutOfStock && !product.preorder_enabled
    ? t('stock.out_of_stock', { ns: 'products', defaultValue: 'Out of stock' })
    : isPreorder
      ? t('stock.preorder', { ns: 'products', defaultValue: 'Preorder' })
      : t('addToCart', { ns: 'products', defaultValue: 'Add to cart' })

  const productUrl = `/${currentLang}/products/${product.slug || product.id}`

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl',
        'bg-card border border-border/40 hover:border-border/80 text-card-foreground',
        'p-3 sm:p-3.5 lg:p-4 h-full',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs',
        'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/40 has-[:focus-visible]:border-border',
        isOutOfStock && !product.preorder_enabled && 'opacity-70',
        className,
      )}
    >
      {/* 1 ── Header / Thumbnail */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-secondary/40 mb-3 sm:mb-3.5 flex items-center justify-center">
        <Link to={productUrl} tabIndex={-1} className="block size-full">
          {coverImageUrl && !imageFailed ? (
            <img
              src={coverImageUrl}
              alt={product.name}
              className="size-full object-cover"
              loading="lazy"
              onError={() => coverImageUrl && setFailedUrl(coverImageUrl)}
            />
          ) : (
            <div
              className="flex size-full items-center justify-center bg-secondary/40 text-muted-foreground"
              role="img"
              aria-label={product.name}
            >
              <Box className="size-10 stroke-1 text-muted-foreground/60" />
            </div>
          )}
        </Link>

        {/* Sale Badge */}
        {product.discount_percentage != null && Number(product.discount_percentage) > 0 && (
          <div className="absolute end-2 top-2 z-10">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 backdrop-blur-xs">
              -{formatNumber(Number(product.discount_percentage), {
                locale: currentLang,
                maximumFractionDigits: 0,
              })}%
            </span>
          </div>
        )}
      </div>

      {/* 2 ── Content */}
      <div className="flex flex-1 flex-col justify-between text-start">
        <div className="space-y-1 mb-3">
          <h3 className="font-semibold text-foreground text-sm sm:text-base leading-snug line-clamp-2">
            <Link
              to={productUrl}
              className="hover:text-primary transition-colors focus:outline-none"
            >
              {product.name}
            </Link>
          </h3>
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* 3 ── Price & CTA */}
        <div className="pt-2 border-t border-border/30 space-y-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-foreground tabular-nums">
              {formattedEffectivePrice}
            </span>
            {formattedBasePrice && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through tabular-nums">
                {formattedBasePrice}
              </span>
            )}
          </div>

          <AddToCartButton
            productName={product.name}
            label={addToCartLabel}
            addedLabel={t('added', { ns: 'products', defaultValue: 'Added' })}
            disabled={isOutOfStock && !product.preorder_enabled}
            onClick={handleAddToCart}
          />
        </div>
      </div>
    </article>
  )
}
