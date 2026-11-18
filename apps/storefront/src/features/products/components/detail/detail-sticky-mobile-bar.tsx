import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Check, ShoppingCart } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { formatMoneyFromMinor } from '@workspace/domain/formatters/money'
import type { ProductPlan } from '@workspace/domain/schemas/product'
import { resolveLocalizedName } from '../../../cart/lib/cart-selectors'

export interface DetailStickyMobileBarProps {
  selectedPlan: ProductPlan
  isVisible: boolean
  isInCart: boolean
  isJustAdded: boolean
  onAddToCart: () => void
  lang: string
}

export function DetailStickyMobileBar({
  selectedPlan,
  isVisible,
  isInCart,
  isJustAdded,
  onAddToCart,
  lang,
}: DetailStickyMobileBarProps) {
  const { t } = useTranslation(['detail', 'common'])
  const navigate = useNavigate()

  if (!isVisible) return null

  const isOutOfStock = selectedPlan.stock === 0
  const planName = resolveLocalizedName(selectedPlan.name, lang)
  const formattedPrice = formatMoneyFromMinor(
    selectedPlan.price.amountMinor,
    selectedPlan.price.currency,
    lang,
  )

  const handleAction = () => {
    if (isOutOfStock) return
    if (isInCart) {
      navigate(`/${lang}/cart`)
      return
    }
    onAddToCart()
  }

  return (
    <aside
      aria-label={t('addToCart')}
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
            {planName}
          </span>
          <span className="text-base font-semibold text-foreground tabular-nums">
            {formattedPrice}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <Button
            type="button"
            size="sm"
            disabled={isOutOfStock}
            onClick={handleAction}
            className={cn(
              'h-10 px-5 rounded-full font-medium text-xs sm:text-sm shadow-xs',
              isInCart
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {isOutOfStock ? (
              t('outOfStock')
            ) : isJustAdded ? (
              <span className="flex items-center gap-1.5">
                <Check className="size-4" />
                {t('added')}
              </span>
            ) : isInCart ? (
              <span className="flex items-center gap-1.5">
                <ShoppingCart className="size-4" />
                {t('inCart')}
              </span>
            ) : (
              t('addToCart')
            )}
          </Button>

          {isInCart && (
            <Link
              to={`/${lang}/cart`}
              className="text-[11px] text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {t('viewCart')}
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}
