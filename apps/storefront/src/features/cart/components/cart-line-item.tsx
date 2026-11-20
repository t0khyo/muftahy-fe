import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { KeyRound, Minus, Plus, Trash2 } from 'lucide-react'
import { formatMoneyFromMinor, toPiasters } from '@workspace/domain/formatters/money'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { CART_CONFIG } from '../cart.config'
import type { CartItem } from '../stores/cart-store'
import { resolveLocalizedName } from '../lib/cart-selectors'
import { resolveProductImage } from '../../products/utils/asset-resolver'
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
  const { t } = useTranslation(['cart', 'products', 'common'])
  const { data: product } = useProduct(item.product_id || item.slug || '')

  const maxAllowed = Math.min(
    product?.available_count && product.available_count > 0
      ? product.available_count
      : CART_CONFIG.maxQuantityPerLine,
    CART_CONFIG.maxQuantityPerLine,
  )

  const isOutOfStock = product ? product.stock_status === 'out_of_stock' : false
  const isLowStock =
    product && product.stock_status === 'in_stock' && product.available_count <= 3

  const productName = resolveLocalizedName(item.name, lang) || item.product_name
  const unitPiasters = toPiasters(item.unit_price_egp)
  const formattedUnitPrice = formatMoneyFromMinor(unitPiasters, 'EGP', lang)
  const formattedLineTotal = formatMoneyFromMinor(
    unitPiasters * item.quantity,
    'EGP',
    lang,
  )

  const increaseLabel = t('increaseQuantityFor', {
    product: productName,
    plan: productName,
  })
  const decreaseLabel = t('decreaseQuantityFor', {
    product: productName,
    plan: productName,
  })
  const removeLabel = t('removeItemFor', {
    product: productName,
    plan: productName,
  })

  const category = item.category ?? product?.category ?? 'windows'
  const variant = item.variant ?? product?.variant ?? null
  const coverImage =
    item.coverImage || resolveProductImage(category, variant)

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
          ) : (
            <KeyRound
              className="size-7 lg:size-8 text-muted-foreground/80"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Title, Variant, Preorder Badge, Unit Price */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/${lang}/products/${item.product_id}`}
              className="font-semibold text-foreground hover:text-primary transition-colors text-base line-clamp-2 leading-snug"
            >
              {productName}
            </Link>

            {variant && (
              <Badge variant="outline" className="text-[11px] px-2 py-0.5 uppercase">
                {t(`variants.${variant}`, { ns: 'products', defaultValue: variant })}
              </Badge>
            )}

            {item.is_preorder && (
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-medium"
              >
                {t('stock.preorder', { ns: 'products', defaultValue: 'Preorder' })}
              </Badge>
            )}

            {isOutOfStock && !item.is_preorder && (
              <Badge variant="destructive" className="text-[11px] px-2 py-0.5">
                {t('stock.out_of_stock', { ns: 'products', defaultValue: 'Out of stock' })}
              </Badge>
            )}

            {isLowStock && (
              <Badge variant="outline" className="text-[11px] px-2 py-0.5 text-warning border-warning/40">
                {t('lowStock', { count: product?.available_count ?? 0, ns: 'products' })}
              </Badge>
            )}
          </div>

          {item.is_preorder && (
            <p className="text-xs text-muted-foreground">
              {t('preorderDisclaimer', {
                ns: 'products',
                defaultValue: 'Preorder item: code will be fulfilled upon restock.',
              })}
            </p>
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
            disabled={item.quantity <= 1 || (isOutOfStock && !item.is_preorder)}
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
            disabled={item.quantity >= maxAllowed || (isOutOfStock && !item.is_preorder)}
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
