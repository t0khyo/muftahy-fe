import * as React from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ArrowRight,
  Headphones,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Zap,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { CART_CONFIG } from '../features/cart/cart.config'
import { CartLineItem } from '../features/cart/components/cart-line-item'
import { getCurrencySubtotals } from '../features/cart/lib/cart-selectors'
import { useCartStore } from '../features/cart/stores/cart-store'

export function CartRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t, i18n } = useTranslation(['cart', 'header', 'common'])
  const isRtl = lang === 'ar' || i18n.dir() === 'rtl'

  const items = useCartStore((s) => s.items)
  const count = useCartStore((s) => s.count)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)

  const emptyBrowseRef = React.useRef<HTMLAnchorElement | null>(null)
  const removeRefs = React.useRef<Map<string, HTMLButtonElement | null>>(new Map())
  const itemIds = React.useMemo(() => items.map((i) => i.id), [items])

  const [promoCode, setPromoCode] = React.useState('')
  const [promoApplied, setPromoApplied] = React.useState(false)

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (promoCode.trim()) {
      setPromoApplied(true)
    }
  }

  const handleRemove = React.useCallback(
    (id: string) => {
      const index = itemIds.indexOf(id)
      const nextId = itemIds[index + 1]
      const prevId = itemIds[index - 1]

      removeItem(id)

      // Focus handoff
      requestAnimationFrame(() => {
        if (nextId && removeRefs.current.get(nextId)) {
          removeRefs.current.get(nextId)?.focus()
        } else if (prevId && removeRefs.current.get(prevId)) {
          removeRefs.current.get(prevId)?.focus()
        } else {
          emptyBrowseRef.current?.focus()
        }
      })
    },
    [itemIds, removeItem],
  )

  const currencySubtotals = React.useMemo(() => {
    return getCurrencySubtotals(items, lang)
  }, [items, lang])

  const itemsCountText = t('items', {
    ns: 'header',
    count,
    defaultValue: `${count} items`,
  })

  return (
    <main id="main" className="site-container py-8 sm:py-12">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="space-y-2 text-start">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                {t('title', { ns: 'cart', defaultValue: 'Shopping Cart' })}
              </h1>
              {count > 0 && (
                <span className="text-sm sm:text-base font-normal text-muted-foreground tabular-nums">
                  ({itemsCountText})
                </span>
              )}
            </div>

            {count > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-xs text-muted-foreground hover:text-destructive gap-1.5 cursor-pointer"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                <span>{t('clearCart', { ns: 'cart', defaultValue: 'Clear bag' })}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-primary font-medium">
            <Zap className="size-4 shrink-0 fill-primary/20" aria-hidden="true" />
            <span>
              {t('instantDeliveryDesc', {
                ns: 'cart',
                defaultValue:
                  'Keys revealed immediately after payment + sent to your email',
              })}
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center rounded-2xl border border-dashed border-border/70 bg-card/40 max-w-xl mx-auto space-y-4">
            <div className="size-20 rounded-2xl bg-secondary/60 border border-border/40 flex items-center justify-center text-muted-foreground mb-2">
              <ShoppingBag className="size-10" aria-hidden="true" />
            </div>

            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('nothingSelectedYet', {
                ns: 'cart',
                defaultValue: 'Nothing selected yet',
              })}
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t('yourBagIsEmpty', {
                ns: 'cart',
                defaultValue: 'Your bag is empty',
              })}
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
              {t('findNext', {
                ns: 'cart',
                defaultValue: 'Find your next game, license, or subscription.',
              })}
            </p>

            <div className="pt-4 flex flex-col items-center w-full max-w-[280px] gap-2.5">
              <Button
                nativeButton={false}
                render={
                  <Link
                    ref={emptyBrowseRef}
                    to={`/${lang}/products`}
                  />
                }
                variant="default"
                className="w-full h-12 rounded-full font-medium text-sm active:scale-[0.98] transition-transform"
              >
                {t('exploreProducts', {
                  ns: 'cart',
                  defaultValue: 'Explore products',
                })}
              </Button>

              <Button
                nativeButton={false}
                render={
                  <Link
                    to={`/${lang}${CART_CONFIG.bundlesHash}`}
                  />
                }
                variant="outline"
                className="w-full h-12 rounded-full font-medium text-sm border-border/80 hover:bg-secondary/60 active:scale-[0.98] transition-transform"
              >
                {t('browseBundles', {
                  ns: 'cart',
                  defaultValue: 'Browse bundles',
                })}
              </Button>
            </div>
          </div>
        ) : (
          /* ── 2-Column Responsive Layout (Desktop 12-col grid) ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* 1 ── Items Column (8-col) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xs p-4 sm:p-6 shadow-xs">
                <ul className="divide-y divide-border/40" aria-label={t('title', { ns: 'cart' })}>
                  {items.map((item) => (
                    <CartLineItem
                      key={item.id}
                      item={item}
                      lang={lang}
                      onUpdateQuantity={updateQuantity}
                      onRemove={handleRemove}
                      removeButtonRef={(el) => {
                        if (el) {
                          removeRefs.current.set(item.id, el)
                        } else {
                          removeRefs.current.delete(item.id)
                        }
                      }}
                    />
                  ))}
                </ul>
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2 text-start">
                <Link
                  to={`/${lang}/products`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                >
                  {isRtl ? (
                    <ArrowRight className="size-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                  ) : (
                    <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                  )}
                  <span>{t('continueShopping', { ns: 'cart', defaultValue: 'Continue Shopping' })}</span>
                </Link>
              </div>
            </div>

            {/* 2 ── Sticky Order Summary Sidebar (4-col) */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-6 text-start">
                <h2 className="text-xl font-bold text-foreground">
                  {t('orderSummary', { ns: 'cart', defaultValue: 'Order Summary' })}
                </h2>

                <div className="space-y-3 text-sm">
                  {/* Subtotal */}
                  <div className="space-y-1">
                    {currencySubtotals.map((sub) => (
                      <div
                        key={sub.currency}
                        className="flex items-center justify-between text-muted-foreground"
                      >
                        <span>
                          {t('subtotal', { ns: 'cart', defaultValue: 'Subtotal' })}
                          {currencySubtotals.length > 1 ? ` (${sub.currency})` : ''}
                        </span>
                        <span className="font-medium text-foreground tabular-nums">
                          {sub.formatted}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery */}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Zap className="size-3.5 text-primary fill-primary/20" aria-hidden="true" />
                      {t('freeInstantDelivery', {
                        ns: 'cart',
                        defaultValue: 'Free Instant Delivery',
                      })}
                    </span>
                    <span className="text-primary font-semibold">
                      {isRtl ? 'مجاني' : 'FREE'}
                    </span>
                  </div>

                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyPromo} className="pt-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder={t('promoCodePlaceholder', {
                          ns: 'cart',
                          defaultValue: 'Enter promo code',
                        })}
                        className="h-10 text-xs rounded-xl"
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={!promoCode.trim() || promoApplied}
                        className="h-10 px-4 rounded-xl text-xs shrink-0"
                      >
                        {promoApplied
                          ? (isRtl ? 'تم التطبيق' : 'Applied')
                          : t('applyPromo', { ns: 'cart', defaultValue: 'Apply' })}
                      </Button>
                    </div>
                  </form>

                  {/* Separator */}
                  <div className="border-t border-border/40 pt-3" />

                  {/* Grand Total */}
                  <div className="space-y-1">
                    {currencySubtotals.map((sub) => (
                      <div
                        key={sub.currency}
                        className="flex items-baseline justify-between"
                      >
                        <span className="text-base font-semibold text-foreground">
                          {t('total', { ns: 'cart', defaultValue: 'Total' })}
                          {currencySubtotals.length > 1 ? ` (${sub.currency})` : ''}
                        </span>
                        <span className="text-2xl font-bold text-foreground tabular-nums">
                          {sub.formatted}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Proceed to Checkout CTA (48px pill) */}
                <Button
                  nativeButton={false}
                  render={<Link to={`/${lang}/checkout`} />}
                  variant="default"
                  className="w-full h-12 rounded-full font-medium text-sm active:scale-[0.98] transition-transform shadow-sm"
                >
                  {t('proceedToCheckout', {
                    ns: 'cart',
                    defaultValue: 'Proceed to Checkout',
                  })}
                </Button>

                {/* Trust Seals */}
                <div className="pt-3 border-t border-border/30 space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary shrink-0" aria-hidden="true" />
                    <span>{isRtl ? 'ضمان مفاتيح رسمية 100% ومضمونة' : '100% verified official distributor keys'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="size-4 text-primary shrink-0" aria-hidden="true" />
                    <span>{isRtl ? 'تسليم رقمي فوري خلال ثوانٍ' : 'Instant digital delivery within seconds'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-primary shrink-0" aria-hidden="true" />
                    <span>{isRtl ? 'دفع آمن ومشفّر بأحدث المعايير' : '256-bit encrypted secure checkout'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Headphones className="size-4 text-primary shrink-0" aria-hidden="true" />
                    <span>{isRtl ? 'دعم فني عبر واتساب للمساعدة في التفعيل' : 'Dedicated activation & warranty support'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
