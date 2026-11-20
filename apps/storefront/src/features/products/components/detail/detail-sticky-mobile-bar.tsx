import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Check, ShoppingCart } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { formatMoney } from '@workspace/domain/formatters/money'
import type { ProductResponse } from '@workspace/domain/schemas/product'

export interface DetailStickyMobileBarProps {
  product: ProductResponse
  isVisible: boolean
  isInCart: boolean
  isJustAdded: boolean
  onAddToCart: () => void
  lang: string
}

export function DetailStickyMobileBar({
  product,
  isVisible,
  isInCart,
  isJustAdded,
  onAddToCart,
  lang,
}: DetailStickyMobileBarProps) {
  const { t } = useTranslation(['detail', 'products', 'common'])
  const navigate = useNavigate()

  if (!isVisible) return null

  const isOutOfStock = product.stock_status === 'out_of_stock'
  const isPreorder = product.stock_status === 'preorder'
  const formattedPrice = formatMoney(Number(product.effective_price), {
    currency: 'EGP',
    locale: lang,
  })

  const handleAction = () => {
    if (isOutOfStock && !product.preorder_enabled) return
    if (isInCart) {
      navigate(`/${lang}/cart`)
      return
    }
    onAddToCart()
  }

  return (
    <aside
      aria-label={t('addToCart', { ns: 'products', defaultValue: 'Add to Cart' })}
      className={cn(
        'fixed bottom-0 inset-x-0 z-30 md:hidden',
        'bg-background/95 backdrop-blur-md border-t border-border/60 shadow-lg',
        'px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]',
        'transition-transform duration-200 ease-out',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="truncate text-start flex-1">
          <span className="text-xs text-muted-foreground block truncate">
            {product.name}
          </span>
          <span className="text-base font-semibold text-foreground tabular-nums">
            {formattedPrice}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <Button
            type="button"
            size="sm"
            disabled={isOutOfStock && !product.preorder_enabled}
            onClick={handleAction}
            className={cn(
              'h-10 px-5 rounded-full font-medium text-xs sm:text-sm shadow-xs',
              isInCart
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {isOutOfStock && !product.preorder_enabled ? (
              t('stock.out_of_stock', { ns: 'products', defaultValue: 'Out of Stock' })
            ) : isJustAdded ? (
              <span className="flex items-center gap-1.5">
                <Check className="size-4" />
                {t('added', { ns: 'common', defaultValue: 'Added!' })}
              </span>
            ) : isInCart ? (
              <span className="flex items-center gap-1.5">
                <ShoppingCart className="size-4" />
                {t('inCart', { ns: 'common', defaultValue: 'In Cart' })}
              </span>
            ) : isPreorder ? (
              t('stock.preorder', { ns: 'products', defaultValue: 'Preorder' })
            ) : (
              t('addToCart', { ns: 'products', defaultValue: 'Add to Cart' })
            )}
          </Button>

          {isInCart && (
            <Link
              to={`/${lang}/cart`}
              className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              {t('viewCart', { ns: 'common', defaultValue: 'View Cart' })}
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}
