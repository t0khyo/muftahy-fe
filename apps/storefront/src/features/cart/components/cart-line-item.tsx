import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { KeyRound, Trash2 } from 'lucide-react'
import { formatMoney } from '@workspace/domain/formatters/money'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import type { CartItem } from '../stores/cart-store'
import { resolveLocalizedName } from '../lib/cart-selectors'
import { resolveProductImage, resolveStorageUrl, getProductMainImageUrl } from '../../products/utils/asset-resolver'
import { useProduct } from '../../products/hooks/use-products'

export interface CartLineItemProps {
  item: CartItem
  lang: string
  onUpdateQuantity?: (id: string, qty: number, maxStock?: number) => void
  onRemove: (id: string) => void
  removeButtonRef?: (el: HTMLButtonElement | null) => void
}

export function CartLineItem({
  item,
  lang,
  onRemove,
  removeButtonRef,
}: CartLineItemProps) {
  const { t } = useTranslation(['cart', 'products', 'common'])
  const { data: product } = useProduct(item.product_id || item.slug || '')

  const isOutOfStock = product ? product.stock_status === 'out_of_stock' : false
  const isLowStock =
    product && product.stock_status === 'in_stock' && product.available_count <= 3

  const productName = resolveLocalizedName(item.name, lang) || item.product_name
  const unitPrice =
    typeof item.unit_price === 'number'
      ? item.unit_price
      : item.unit_price_egp
        ? Number(item.unit_price_egp)
        : 0

  const formattedUnitPrice = formatMoney(unitPrice, { currency: 'EGP', locale: lang })
  const formattedLineTotal = formatMoney(unitPrice * item.quantity, { currency: 'EGP', locale: lang })

  const removeLabel = t('removeItemFor', {
    product: productName,
    plan: productName,
  })

  const category = item.category ?? product?.category?.slug ?? 'windows'
  const variant = item.variant ?? product?.variant ?? null
  const coverImage =
    resolveStorageUrl(item.coverImage) ||
    item.coverImage ||
    getProductMainImageUrl(product) ||
    resolveProductImage(category, variant)

  return (
    <li className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 sm:py-5">
      {/* 1 ── Start Side: Artwork Thumbnail + Info */}
      <div className="flex items-start gap-4 min-w-0 flex-1 text-start">
        {/* Artwork Thumbnail */}
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
              to={`/${lang}/products/${product?.slug || item.slug || item.product_id}`}
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

      {/* 2 ── End Side: Static Quantity Badge, Line Price, Remove Action */}
      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t border-border/20 sm:border-t-0 shrink-0">
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border/60 bg-secondary/30 text-sm">
          <span className="text-xs text-muted-foreground me-1.5">
            {t('quantity', { defaultValue: 'Qty' })}:
          </span>
          <span
            className="font-semibold tabular-nums text-foreground select-none"
            aria-label={`${t('quantity', { defaultValue: 'Quantity' })}: ${item.quantity}`}
          >
            {item.quantity}
          </span>
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
