import * as React from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Gamepad2, KeyRound, Minus, Plus, Trash2 } from 'lucide-react'
import { formatMoneyFromMinor } from '@workspace/domain/formatters/money'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { CART_CONFIG } from '../cart.config'
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
    return (
      product.plans.find((p) => p.id === item.planId || p.slug === item.planId) ??
      product.plans[0]
    )
  }, [product, item.planId])

  const maxAllowed = Math.min(
    resolvedPlan?.stock ?? CART_CONFIG.maxQuantityPerLine,
    CART_CONFIG.maxQuantityPerLine,
  )
  const isOutOfStock = resolvedPlan ? resolvedPlan.stock === 0 : false
  const isLowStock = resolvedPlan ? resolvedPlan.stock > 0 && resolvedPlan.stock <= 3 : false

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

  // Artwork resolution
  const coverImage = item.coverImage || product?.coverImage
  const platform = item.platform || product?.platform
  const region = item.region || product?.region

  return (
    <li className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 sm:py-5">
      {/* 1 ── Start Side: Artwork Thumbnail + Info */}
      <div className="flex items-start gap-4 min-w-0 flex-1 text-start">
        {/* Artwork Thumbnail (72px mobile / 80px desktop) */}
        <div className="size-[72px] lg:size-20 shrink-0 rounded-xl overflow-hidden bg-secondary/60 border border-border/40 flex items-center justify-center">
          {coverImage ? (
            <img
              src={coverImage}
              alt=""
              className="size-full object-cover"
            />
          ) : platform === 'steam' || platform === 'playstation' || platform === 'xbox' ? (
            <Gamepad2
              className="size-7 lg:size-8 text-muted-foreground/80"
              aria-hidden="true"
            />
          ) : (
            <KeyRound
              className="size-7 lg:size-8 text-muted-foreground/80"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Title, Plan, Tags, Unit Price */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/${lang}/products/${item.slug}`}
              className="font-semibold text-foreground hover:text-primary transition-colors text-base line-clamp-2 leading-snug"
            >
              {productName}
            </Link>

            {planLabel && (
              <span className="text-xs text-muted-foreground font-normal">
                ({planLabel})
              </span>
            )}

            {isOutOfStock && (
              <Badge variant="destructive" className="text-[11px] px-2 py-0.5">
                {t('outOfStock', { defaultValue: 'Out of stock' })}
              </Badge>
            )}

            {isLowStock && !isOutOfStock && (
              <Badge variant="outline" className="text-[11px] px-2 py-0.5 text-warning border-warning/40">
                {t('limitedStock', { count: resolvedPlan?.stock ?? 0 })}
              </Badge>
            )}
          </div>

          {(platform || region) && (
            <div className="text-xs text-muted-foreground/80 uppercase tracking-wide truncate">
              {[platform, region].filter(Boolean).join(' • ')}
            </div>
          )}

          <div className="text-xs text-muted-foreground tabular-nums">
            <span className="me-1">{t('unitPrice', { defaultValue: 'Unit price' })}:</span>
            <span>{formattedUnitPrice}</span>
          </div>
        </div>
      </div>

      {/* 2 ── End Side: Quantity Stepper, Line Price, Remove Action */}
      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t border-border/20 sm:border-t-0 shrink-0">
        {/* Quantity Stepper (44px mobile / 36px desktop) */}
        <div className="inline-flex items-center rounded-lg border border-border/60 bg-secondary/30 h-11 lg:h-9">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-9 lg:h-9 lg:w-8 rounded-none rounded-s-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-transform"
            disabled={item.quantity <= 1 || isOutOfStock}
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1, maxAllowed)}
            aria-label={decreaseLabel}
          >
            <Minus className="size-3.5" aria-hidden="true" />
          </Button>

          <span
            className="w-8 text-center text-sm font-semibold tabular-nums text-foreground select-none"
            aria-live="polite"
            aria-label={`${t('quantity', { defaultValue: 'Quantity' })}: ${item.quantity}`}
          >
            {item.quantity}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-9 lg:h-9 lg:w-8 rounded-none rounded-e-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-transform"
            disabled={item.quantity >= maxAllowed || isOutOfStock}
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1, maxAllowed)}
            aria-label={increaseLabel}
          >
            <Plus className="size-3.5" aria-hidden="true" />
          </Button>
        </div>

        {/* Line Total */}
        <div className="text-end min-w-[5.5rem]">
          <span className="font-semibold text-foreground text-base tabular-nums">
            {formattedLineTotal}
          </span>
        </div>

        {/* Remove Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          ref={removeButtonRef}
          className="size-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors active:scale-95"
          onClick={() => onRemove(item.id)}
          aria-label={removeLabel}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </li>
  )
}
