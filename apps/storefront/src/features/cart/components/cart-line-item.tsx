import * as React from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { formatMoneyFromMinor } from '@workspace/domain/formatters/money'
import type { CartItem } from '../stores/cart-store'
import { resolveLocalizedName } from '../lib/cart-selectors'
import { useProduct } from '../../products/hooks/use-products'

export interface CartLineItemProps {
  item: CartItem
  lang: string
  onUpdateQuantity: (id: string, qty: number, maxStock?: number) => void
  onRemove: (id: string) => void
  removeButtonRef?: (el: HTMLButtonElement | null) => void
}

export function CartLineItem({
  item,
  lang,
  onUpdateQuantity,
  onRemove,
  removeButtonRef,
}: CartLineItemProps) {
  const { t } = useTranslation(['cart', 'common'])
  const { data: product } = useProduct(item.slug)

  const resolvedPlan = React.useMemo(() => {
    if (!product || !product.plans) return null
    return product.plans.find((p) => p.id === item.planId || p.slug === item.planId) ?? product.plans[0]
  }, [product, item.planId])

  const stock = resolvedPlan ? resolvedPlan.stock : 10
  const isOutOfStock = stock === 0
  const isOverStock = stock > 0 && item.quantity > stock

  const productName = resolveLocalizedName(item.name, lang)
  const planLabel = resolveLocalizedName(item.planName, lang)
  const formattedUnitPrice = formatMoneyFromMinor(item.priceMinor, item.currency, lang)
  const formattedLineTotal = formatMoneyFromMinor(
    item.priceMinor * item.quantity,
    item.currency,
    lang,
  )

  const increaseLabel = t('increaseQuantityFor', {
    product: productName,
    plan: planLabel || productName,
  })
  const decreaseLabel = t('decreaseQuantityFor', {
    product: productName,
    plan: planLabel || productName,
  })
  const removeLabel = t('removeItemFor', {
    product: productName,
    plan: planLabel || productName,
  })

  return (
    <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border/40 last:border-b-0">
      <div className="flex-1 space-y-1 text-start">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/${lang}/products/${item.slug}`}
            className="font-medium text-foreground hover:text-primary transition-colors text-base"
          >
            {productName}
          </Link>
          {planLabel && (
            <span className="text-xs text-muted-foreground font-normal">
              ({planLabel})
            </span>
          )}
          {isOutOfStock && (
            <Badge variant="destructive" className="text-xs">
              {t('itemUnavailable')}
            </Badge>
          )}
          {isOverStock && (
            <Badge variant="outline" className="text-xs text-warning border-warning">
              {t('limitedStock', { count: stock })}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {formattedUnitPrice}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center gap-1 border border-input rounded-xl p-1 bg-background">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg"
            disabled={item.quantity <= 1 || isOutOfStock}
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1, stock)}
            aria-label={decreaseLabel}
          >
            <Minus className="size-3.5" aria-hidden="true" />
          </Button>

          <span
            className="w-8 text-center text-sm font-medium tabular-nums text-foreground"
            aria-live="polite"
          >
            {item.quantity}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg"
            disabled={item.quantity >= stock || isOutOfStock}
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1, stock)}
            aria-label={increaseLabel}
          >
            <Plus className="size-3.5" aria-hidden="true" />
          </Button>
        </div>

        {/* Line Total */}
        <div className="text-end min-w-[5rem]">
          <span className="font-semibold text-foreground text-sm tabular-nums">
            {formattedLineTotal}
          </span>
        </div>

        {/* Remove Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          ref={removeButtonRef}
          className="size-8 text-muted-foreground hover:text-destructive rounded-lg"
          onClick={() => onRemove(item.id)}
          aria-label={removeLabel}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </li>
  )
}
