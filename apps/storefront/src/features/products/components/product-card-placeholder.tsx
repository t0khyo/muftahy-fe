// Replace with the designed product card
import { useParams } from 'react-router'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import type { Product } from '@workspace/domain/schemas/product'
import { formatMoneyFromMinor } from '@workspace/domain/formatters/money'

export interface ProductCardPlaceholderProps {
  product?: Product
  className?: string
}

export function ProductCardPlaceholder({
  product,
  className = '',
}: ProductCardPlaceholderProps) {
  const { lang } = useParams<{ lang: string }>()
  const isAr = lang === 'ar'

  const title = product ? (isAr ? product.title.ar : product.title.en) : null
  const priceDisplay = product
    ? formatMoneyFromMinor(
        product.price.amountMinor,
        product.price.currency,
        isAr ? 'ar' : 'en',
      )
    : null

  return (
    <Card
      data-testid="product-card-placeholder"
      className={`overflow-hidden border border-border/60 bg-card rounded-2xl shadow-none ${className}`}
    >
      <CardContent className="p-3 space-y-3">
        {/* Image frame */}
        <div className="aspect-4/3 w-full rounded-xl bg-muted flex items-center justify-center overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>

        {/* Title line */}
        <div className="min-h-[2.5rem]">
          {title ? (
            <p className="text-sm font-medium line-clamp-2 text-start text-foreground">
              {title}
            </p>
          ) : (
            <Skeleton className="h-4 w-3/4 rounded" />
          )}
        </div>

        {/* Price line */}
        <div>
          {priceDisplay ? (
            <p className="text-sm font-semibold tabular-nums text-start text-foreground">
              {priceDisplay}
            </p>
          ) : (
            <Skeleton className="h-4 w-1/3 rounded" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
