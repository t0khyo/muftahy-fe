import * as React from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  KeyRound,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from 'lucide-react'
import { formatMoneyFromMinor, toPiasters } from '@workspace/domain/formatters/money'
import { resolveProductImage } from '../../features/products/utils/asset-resolver'
import { Button } from '@workspace/ui/components/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { CART_CONFIG } from '../../features/cart/cart.config'
import {
  getCurrencySubtotals,
  resolveLocalizedName,
} from '../../features/cart/lib/cart-selectors'
import { useCartStore } from '../../features/cart/stores/cart-store'

export interface CartButtonProps {
  className?: string
  isOpen?: boolean
  onToggle?: () => void
  onClose?: () => void
}

export function CartButton({
  className = '',
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose: controlledOnClose,
}: CartButtonProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const location = useLocation()
  const { t, i18n } = useTranslation(['header', 'cart', 'common'])
  const isRtl = currentLang === 'ar' || i18n.dir() === 'rtl'

  // Internal open state if uncontrolled
  const [internalIsOpen, setInternalIsOpen] = React.useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen

  const handleToggle = () => {
    if (isControlled) {
      controlledOnToggle?.()
    } else {
      setInternalIsOpen((prev) => !prev)
    }
  }

  const handleClose = React.useCallback(() => {
    if (isControlled) {
      controlledOnClose?.()
    } else {
      setInternalIsOpen(false)
    }
  }, [isControlled, controlledOnClose])

  // Cart store subscriptions
  const items = useCartStore((s) => s.items)
  const count = useCartStore((s) => s.count)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  // Pulse animation on count increase
  const [isPulsing, setIsPulsing] = React.useState(false)
  const prevCountRef = React.useRef(count)

  React.useEffect(() => {
    if (count > prevCountRef.current) {
      setIsPulsing(true)
      const timer = setTimeout(() => setIsPulsing(false), 500)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = count
  }, [count])

  // Polite live region status announcement
  const [liveAnnouncement, setLiveAnnouncement] = React.useState('')

  // Trigger ref for focus return
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  // Subtotals grouped by currency
  const currencySubtotals = React.useMemo(() => {
    return getCurrencySubtotals(items, currentLang)
  }, [items, currentLang])

  // Close panel on route change
  const prevLocationRef = React.useRef(location.pathname + location.search)
  React.useEffect(() => {
    if (prevLocationRef.current !== location.pathname + location.search) {
      prevLocationRef.current = location.pathname + location.search
      if (isOpen) {
        requestAnimationFrame(() => {
          handleClose()
        })
      }
    }
  }, [location.pathname, location.search, isOpen, handleClose])

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  // Stepper handlers
  const handleDecreaseQuantity = (id: string, currentQty: number) => {
    if (currentQty <= 1) return
    updateQuantity(id, currentQty - 1, CART_CONFIG.maxQuantityPerLine)
    setLiveAnnouncement(
      t('quantityUpdated', { ns: 'header', defaultValue: 'Quantity updated' }),
    )
  }

  const handleIncreaseQuantity = (id: string, currentQty: number) => {
    if (currentQty >= CART_CONFIG.maxQuantityPerLine) return
    updateQuantity(id, currentQty + 1, CART_CONFIG.maxQuantityPerLine)
    setLiveAnnouncement(
      t('quantityUpdated', { ns: 'header', defaultValue: 'Quantity updated' }),
    )
  }

  const handleRemove = (id: string) => {
    removeItem(id)
    setLiveAnnouncement(
      t('itemRemoved', { ns: 'header', defaultValue: 'Item removed' }),
    )
  }

  const ariaLabel =
    count === 0
      ? t('cartEmpty', { ns: 'header', defaultValue: 'Cart is empty' })
      : t('cartAria', { ns: 'header', count, defaultValue: `Cart, ${count} items` })

  const badgeText = count > 9 ? '9+' : String(count)

  const itemsCountText = t('items', {
    ns: 'header',
    count,
    defaultValue: `${count} items`,
  })

  return (
    <div className="relative inline-flex items-center">
      {/* ── Cart Trigger Button (Shopping Bag) ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="cart-panel"
        className={`cursor-pointer relative inline-flex items-center justify-center text-foreground/80 transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-11 w-11 lg:h-11 lg:w-9 ${className}`}
      >
        <svg
          aria-hidden="true"
          className={`h-[17px] w-[17px] shrink-0 transition-transform duration-200 ${
            isPulsing ? 'scale-110 text-primary' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>

        {count > 0 && (
          <span
            aria-hidden="true"
            className={`absolute end-1 top-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-foreground px-0.5 text-[10px] font-bold leading-none text-background tabular-nums transition-all duration-200 ${
              isPulsing ? 'scale-125 bg-primary text-primary-foreground' : ''
            }`}
          >
            {badgeText}
          </span>
        )}
      </button>

      {/* ── Slide-Over Panel (End side, 420px desktop, full width/height mobile) ── */}
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleClose()
          }
        }}
      >
        <SheetContent
          id="cart-panel"
          side={isRtl ? 'left' : 'right'}
          showCloseButton={false}
          className="w-full sm:max-w-none lg:w-[420px] lg:max-w-[420px] max-w-full p-0 gap-0 h-full border-s border-border/40 bg-background text-foreground shadow-2xl flex flex-col justify-between"
          aria-label={t('bag', { ns: 'header', defaultValue: 'Bag' })}
        >
          {/* 1 ── Header: "Bag" + count at start, Close X at end */}
          <SheetHeader className="h-14 lg:h-16 px-5 lg:px-6 flex flex-row items-center justify-between border-b border-border/40 shrink-0">
            <div className="flex items-baseline gap-2">
              <SheetTitle className="text-lg lg:text-xl font-semibold text-foreground tracking-tight">
                {t('bag', { ns: 'header', defaultValue: 'Bag' })}
              </SheetTitle>
              {count > 0 && (
                <span className="text-xs sm:text-sm font-normal text-muted-foreground tabular-nums">
                  ({itemsCountText})
                </span>
              )}
            </div>

            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-full cursor-pointer text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                  aria-label={t('close', { ns: 'header', defaultValue: 'Close' })}
                />
              }
            >
              <X className="size-4" aria-hidden="true" />
            </SheetClose>
          </SheetHeader>

          {/* 2 ── Body: Scrollable Item List OR Empty State */}
          {items.length === 0 ? (
            /* Empty State (no footer) */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 space-y-4">
              <div className="size-16 rounded-2xl bg-secondary/60 border border-border/40 flex items-center justify-center text-muted-foreground mb-2">
                <ShoppingBag className="size-8" aria-hidden="true" />
              </div>

              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('nothingSelectedYet', {
                  ns: 'header',
                  defaultValue: 'Nothing selected yet',
                })}
              </span>

              <h2 className="text-[26px] lg:text-[28px] font-semibold text-foreground leading-tight">
                {t('yourBagIsEmpty', {
                  ns: 'header',
                  defaultValue: 'Your bag is empty',
                })}
              </h2>

              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                {t('findNext', {
                  ns: 'header',
                  defaultValue:
                    'Find your next game, license, or subscription.',
                })}
              </p>

              <div className="pt-4 flex flex-col items-center w-full max-w-[280px] gap-2.5">
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      to={`/${currentLang}/products`}
                      onClick={handleClose}
                    />
                  }
                  variant="default"
                  className="w-full h-12 rounded-full font-medium text-sm active:scale-[0.98] transition-transform"
                >
                  {t('exploreProducts', {
                    ns: 'header',
                    defaultValue: 'Explore products',
                  })}
                </Button>

                <Button
                  nativeButton={false}
                  render={
                    <Link
                      to={`/${currentLang}${CART_CONFIG.bundlesHash}`}
                      onClick={handleClose}
                    />
                  }
                  variant="outline"
                  className="w-full h-12 rounded-full font-medium text-sm border-border/80 hover:bg-secondary/60 active:scale-[0.98] transition-transform"
                >
                  {t('browseBundles', {
                    ns: 'header',
                    defaultValue: 'Browse bundles',
                  })}
                </Button>
              </div>
            </div>
          ) : (
            /* Populated Scrollable List (only this scrolls) */
            <div className="flex-1 overflow-y-auto px-5 lg:px-6 py-4 space-y-5">
              {items.map((item) => {
                const productName = resolveLocalizedName(item.name, currentLang) || item.product_name
                const lineTotal = formatMoneyFromMinor(
                  toPiasters(item.unit_price_egp) * item.quantity,
                  'EGP',
                  currentLang,
                )
                const coverImage =
                  item.coverImage ||
                  resolveProductImage(item.category ?? 'windows', item.variant ?? null)

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-5 border-b border-border/30 last:border-b-0 last:pb-0"
                  >
                    {/* Thumbnail: 72px mobile / 80px desktop with coded cover fallback */}
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

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between text-start">
                      <div className="space-y-0.5">
                        <Link
                          to={`/${currentLang}/products/${item.product_id}`}
                          onClick={handleClose}
                          className="text-[15px] font-semibold text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors"
                        >
                          {productName}
                        </Link>

                        {item.variant && (
                          <div className="text-[12px] text-muted-foreground uppercase font-medium">
                            {item.variant}
                          </div>
                        )}
                        {item.is_preorder && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            {t('stock.preorder', { ns: 'products', defaultValue: 'Preorder' })}
                          </div>
                        )}
                      </div>

                      {/* Stepper + Remove row */}
                      <div className="pt-2 flex items-center justify-between gap-3">
                        {/* Stepper (44px tall mobile, 36px desktop) */}
                        <div className="inline-flex items-center rounded-lg border border-border/60 bg-secondary/30 h-11 lg:h-9">
                          <button
                            type="button"
                            onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                            disabled={item.quantity <= 1}
                            aria-label={t('decreaseQuantity', {
                              ns: 'header',
                              defaultValue: 'Decrease quantity',
                            })}
                            className="cursor-pointer h-11 w-9 lg:h-9 lg:w-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-transform"
                          >
                            <Minus className="size-3.5" aria-hidden="true" />
                          </button>

                          <span
                            aria-label={`${t('quantity', { ns: 'header', defaultValue: 'Quantity' })}: ${item.quantity}`}
                            className="w-7 text-center text-sm font-semibold text-foreground tabular-nums select-none"
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                            disabled={item.quantity >= CART_CONFIG.maxQuantityPerLine}
                            aria-label={t('increaseQuantity', {
                              ns: 'header',
                              defaultValue: 'Increase quantity',
                            })}
                            className="cursor-pointer h-11 w-9 lg:h-9 lg:w-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-transform"
                          >
                            <Plus className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        {/* Separate Remove Link */}
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="cursor-pointer text-xs text-muted-foreground hover:text-destructive underline underline-offset-4 decoration-border/60 hover:decoration-destructive transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {t('remove', { ns: 'header', defaultValue: 'Remove' })}
                        </button>
                      </div>
                    </div>

                    {/* End Price Column */}
                    <div className="text-end shrink-0 pt-0.5">
                      <span className="text-[15px] font-semibold text-foreground tabular-nums">
                        {lineTotal}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 3 ── Sticky Footer (Items > 0 only) */}
          {items.length > 0 && (
            <div className="border-t border-border/40 bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] lg:p-6 shrink-0 space-y-4">
              {/* Total Row */}
              <div className="space-y-1">
                {currencySubtotals.map((sub) => (
                  <div
                    key={sub.currency}
                    className="flex items-center justify-between text-start"
                  >
                    <span className="text-sm font-normal text-muted-foreground">
                      {t('total', { ns: 'header', defaultValue: 'Total' })}
                      {currencySubtotals.length > 1 ? ` (${sub.currency})` : ''}
                    </span>
                    <span className="text-lg font-semibold text-foreground tabular-nums">
                      {sub.formatted}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {/* 48px Primary Pill Checkout */}
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      to={`/${currentLang}/checkout`}
                      onClick={handleClose}
                    />
                  }
                  variant="default"
                  className="w-full h-12 rounded-full font-medium text-sm active:scale-[0.98] transition-transform"
                >
                  {t('checkout', { ns: 'header', defaultValue: 'Checkout' })}
                </Button>

                {/* 44px Underlined Ghost "View full bag" */}
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      to={`/${currentLang}/cart`}
                      onClick={handleClose}
                    />
                  }
                  variant="ghost"
                  className="w-full min-h-[44px] text-center text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-border/60 hover:decoration-foreground transition-colors"
                >
                  {t('viewFullBag', {
                    ns: 'header',
                    defaultValue: 'View full bag',
                  })}
                </Button>
              </div>
            </div>
          )}

          {/* Polite live region for screen reader updates */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {liveAnnouncement}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
