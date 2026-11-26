import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Check, Headphones, ShieldCheck, ShoppingCart, Zap } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { formatMoney } from '@workspace/domain/formatters/money'
import { formatNumber } from '@workspace/domain/formatters/number'
import type { ProductResponse } from '@workspace/domain/schemas/product'

export interface DetailBuyBoxProps {
  product: ProductResponse
  onAddToCart: () => void
  isInCart: boolean
  isJustAdded: boolean
  lang: string
}

export function DetailBuyBox({
  product,
  onAddToCart,
  isInCart,
  isJustAdded,
  lang,
}: DetailBuyBoxProps) {
  const { t, i18n } = useTranslation(['detail', 'products', 'common'])
  const navigate = useNavigate()

  const isPreorder = product.stock_status === 'preorder'
  const isOutOfStock = product.stock_status === 'out_of_stock'

  const formattedEffectivePrice = formatMoney(Number(product.effective_price), {
    currency: 'EGP',
    locale: lang,
  })

  const formattedBasePrice = product.sale_price
    ? formatMoney(Number(product.base_price), {
        currency: 'EGP',
        locale: lang,
      })
    : null

  const handleActionClick = () => {
    if (isOutOfStock && !product.preorder_enabled) return
    if (isInCart) {
      navigate(`/${lang}/cart`)
      return
    }
    onAddToCart()
  }

  const actionButtonText = isJustAdded
    ? t('added', { ns: 'common', defaultValue: 'Added!' })
    : isInCart
      ? t('viewCart', { ns: 'common', defaultValue: 'View in Cart' })
      : isOutOfStock && !product.preorder_enabled
        ? t('stock.out_of_stock', { ns: 'products', defaultValue: 'Out of Stock' })
        : isPreorder
          ? t('stock.preorder', { ns: 'products', defaultValue: 'Preorder Now' })
          : t('addToCart', { ns: 'products', defaultValue: 'Add to Cart' })

  return (
    <div className="flex flex-col gap-6 text-start w-full">
      {/* 1. Category & Variant Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="h-7 px-3 text-xs font-semibold uppercase">
          {(() => {
            const catObj = typeof product.category === 'object' && product.category !== null ? product.category : null
            const catSlug = catObj ? catObj.slug : (typeof product.category === 'string' ? product.category : '')
            const catName = catObj ? catObj.name : catSlug
            const isAr = lang === 'ar' || i18n.language === 'ar'
            if (isAr && (catSlug.toLowerCase() === 'windows' || catName.toLowerCase() === 'windows')) return 'ويندوز'
            if (isAr && (catSlug.toLowerCase() === 'office' || catName.toLowerCase() === 'office')) return 'أوفيس'
            return catName || ''
          })()}
        </Badge>
        {product.variant && (
          <Badge variant="outline" className="h-7 px-3 text-xs font-semibold">
            {t(`variants.${product.variant}`, {
              ns: 'products',
              defaultValue: product.variant,
            })}
          </Badge>
        )}
        {product.sku && (
          <span
            dir="ltr"
            className="inline-flex items-center text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/40"
          >
            <span className="text-[10px] text-muted-foreground/70 me-1 uppercase font-sans">
              {t('skuLabel', { defaultValue: 'SKU' })}:
            </span>
            {product.sku}
          </span>
        )}
      </div>

      {/* 2. Product Title & Short Description */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
          {product.name}
        </h1>
        {product.description && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* 3. Price Display Card */}
      <div className="rounded-2xl border border-border/40 bg-secondary/30 p-5 space-y-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums">
            {formattedEffectivePrice}
          </span>
          {formattedBasePrice && (
            <span className="text-base sm:text-lg text-muted-foreground line-through tabular-nums">
              {formattedBasePrice}
            </span>
          )}
          {product.discount_percentage != null && Number(product.discount_percentage) > 0 && (
            <Badge variant="destructive" className="text-xs font-bold">
              -{formatNumber(Number(product.discount_percentage), {
                locale: lang,
                maximumFractionDigits: 0,
              })}%
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <Button
          type="button"
          size="lg"
          disabled={isOutOfStock && !product.preorder_enabled}
          onClick={handleActionClick}
          className="w-full h-12 rounded-full font-medium text-sm sm:text-base gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]"
        >
          {isJustAdded ? (
            <Check className="size-5 shrink-0 animate-in zoom-in-75" />
          ) : (
            <ShoppingCart className="size-5 shrink-0" />
          )}
          <span>{actionButtonText}</span>
        </Button>
      </div>

      {/* 4. Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/20 border border-border/30">
          <Zap className="size-4 text-primary shrink-0" aria-hidden="true" />
          <span>{lang === 'ar' ? 'تسليم فوري للمفتاح' : 'Instant digital key delivery'}</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/20 border border-border/30">
          <ShieldCheck className="size-4 text-primary shrink-0" aria-hidden="true" />
          <span>{lang === 'ar' ? 'ترخيص أصلي 100%' : '100% Genuine license'}</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/20 border border-border/30">
          <Headphones className="size-4 text-primary shrink-0" aria-hidden="true" />
          <span>{lang === 'ar' ? 'دعم فني عبر واتساب' : 'WhatsApp customer support'}</span>
        </div>
      </div>
    </div>
  )
}
