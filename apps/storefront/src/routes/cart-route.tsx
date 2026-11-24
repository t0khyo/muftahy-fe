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
import { formatMoney } from '@workspace/domain/formatters/money'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Card } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@workspace/ui/components/empty'
import { CART_CONFIG } from '../features/cart/cart.config'
import { CartLineItem } from '../features/cart/components/cart-line-item'
import {
  useApplyPromoCode,
  useCart,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from '../features/cart/hooks/use-cart'
import { useCartStore } from '../features/cart/stores/cart-store'

export function CartRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t, i18n } = useTranslation(['cart', 'header', 'common'])
  const isRtl = lang === 'ar' || i18n.dir() === 'rtl'

  const cart = useCart()
  const { mutate: removeItemMutation } = useRemoveCartItem()
  const { mutate: updateQuantityMutation } = useUpdateCartItemQuantity()
  const { mutateAsync: validatePromoMutation, isPending: isCheckingPromo } = useApplyPromoCode()
  const clearLocalCart = useCartStore((s) => s.clear)

  const items = cart.items
  const count = cart.item_count

  const emptyBrowseRef = React.useRef<HTMLAnchorElement | null>(null)
  const removeRefs = React.useRef<Map<string, HTMLButtonElement | null>>(new Map())
  const itemIds = React.useMemo(() => items.map((i) => i.id), [items])

  const [promoCode, setPromoCode] = React.useState('')
  const [promoError, setPromoError] = React.useState<string | null>(null)
  const [promoDiscount, setPromoDiscount] = React.useState<number | null>(null)
  const [finalTotal, setFinalTotal] = React.useState<number | null>(null)

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) return

    setPromoError(null)
    try {
      const res = await validatePromoMutation(promoCode.trim())
      if (res.valid) {
        setPromoDiscount(res.total_discount)
        setFinalTotal(res.final_total)
      } else {
        setPromoError(res.error_message || (isRtl ? 'كود الخصم غير صالح' : 'Invalid promo code'))
        setPromoDiscount(null)
        setFinalTotal(null)
      }
    } catch {
      setPromoError(isRtl ? 'تعذر التحقق من كود الخصم' : 'Failed to validate promo code')
    }
  }

  const handleUpdateQuantity = React.useCallback(
    (id: string, quantity: number, maxStock?: number) => {
      updateQuantityMutation({ itemId: id, quantity, maxStock })
      setPromoDiscount(null)
      setFinalTotal(null)
    },
    [updateQuantityMutation],
  )

  const handleRemove = React.useCallback(
    (id: string) => {
      const index = itemIds.indexOf(id)
      const nextId = itemIds[index + 1]
      const prevId = itemIds[index - 1]

      removeItemMutation(id)
      setPromoDiscount(null)
      setFinalTotal(null)

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
    [itemIds, removeItemMutation],
  )

  const formattedSubtotal = formatMoney(cart.subtotal_egp, { currency: 'EGP', locale: lang })
  const formattedDiscount = promoDiscount
    ? formatMoney(promoDiscount, { currency: 'EGP', locale: lang })
    : null
  const formattedFinalTotal = formatMoney(finalTotal ?? cart.subtotal_egp, {
    currency: 'EGP',
    locale: lang,
  })

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
                onClick={clearLocalCart}
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
          /* Empty State */
          <Empty className="border border-dashed border-border/70 bg-card/40 max-w-xl mx-auto p-8 sm:p-16">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-20 rounded-2xl bg-secondary/60 border border-border/40 mb-2">
                <ShoppingBag className="size-10 text-muted-foreground" aria-hidden="true" />
              </EmptyMedia>

              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('nothingSelectedYet', {
                  ns: 'cart',
                  defaultValue: 'Nothing selected yet',
                })}
              </span>

              <EmptyTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                <h2>
                  {t('yourBagIsEmpty', {
                    ns: 'cart',
                    defaultValue: 'Your bag is empty',
                  })}
                </h2>
              </EmptyTitle>

              <EmptyDescription className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
                {t('findNext', {
                  ns: 'cart',
                  defaultValue: 'Find your next game, license, or subscription.',
                })}
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent className="pt-4 flex flex-col items-center w-full max-w-[280px] gap-2.5">
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
            </EmptyContent>
          </Empty>
        ) : (
          /* 2-Column Responsive Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Items Column */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xs p-4 sm:p-6 shadow-xs">
                <ul className="divide-y divide-border/40" aria-label={t('title', { ns: 'cart' })}>
                  {items.map((item) => (
                    <CartLineItem
                      key={item.id}
                      item={item as unknown as Parameters<typeof CartLineItem>[0]['item']}
                      lang={lang}
                      onUpdateQuantity={handleUpdateQuantity}
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

            {/* Sticky Order Summary Sidebar */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-4">
              <Card className="rounded-2xl border-border/60 bg-card p-6 shadow-sm space-y-6 text-start">
                <h2 className="text-xl font-bold text-foreground">
                  {t('orderSummary', { ns: 'cart', defaultValue: 'Order Summary' })}
                </h2>

                <div className="space-y-3 text-sm">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{t('subtotal', { ns: 'cart', defaultValue: 'Subtotal' })}</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {formattedSubtotal}
                    </span>
                  </div>

                  {/* Promo Discount Row (if applied) */}
                  {formattedDiscount && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>{t('discount', { ns: 'cart', defaultValue: 'Discount' })} ({promoCode.trim()})</span>
                      <span className="tabular-nums">- {formattedDiscount}</span>
                    </div>
                  )}

                  {/* Delivery */}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Zap className="size-3.5 text-primary fill-primary/20" aria-hidden="true" />
                      <span>{t('freeInstantDelivery', { ns: 'cart', defaultValue: 'Free Instant Delivery' })}</span>
                    </span>
                    <span className="text-primary font-semibold">
                      {isRtl ? 'مجاني' : 'FREE'}
                    </span>
                  </div>

                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyPromo} className="pt-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value)
                          if (promoError) setPromoError(null)
                        }}
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
                        disabled={!promoCode.trim() || isCheckingPromo}
                        className="h-10 px-4 rounded-xl text-xs shrink-0"
                      >
                        {isCheckingPromo
                          ? (isRtl ? 'جار التحقق...' : 'Checking...')
                          : promoDiscount !== null
                            ? (isRtl ? 'تم التطبيق' : 'Applied')
                            : t('applyPromo', { ns: 'cart', defaultValue: 'Apply' })}
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-destructive">{promoError}</p>
                    )}
                  </form>

                  <Separator className="my-3 bg-border/40" />

                  {/* Grand Total */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-semibold text-foreground">
                      {t('total', { ns: 'cart', defaultValue: 'Total' })}
                    </span>
                    <span className="text-2xl font-bold text-foreground tabular-nums">
                      {formattedFinalTotal}
                    </span>
                  </div>
                </div>

                {/* Primary Proceed to Checkout CTA */}
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      to={
                        promoDiscount !== null
                          ? `/${lang}/checkout?promo=${encodeURIComponent(promoCode.trim())}`
                          : `/${lang}/checkout`
                      }
                    />
                  }
                  variant="default"
                  className="w-full h-12 rounded-full font-medium text-sm active:scale-[0.98] transition-transform shadow-sm"
                >
                  {t('proceedToCheckout', {
                    ns: 'cart',
                    defaultValue: 'Proceed to Checkout',
                  })}
                </Button>

                {/* Trust Seals */}
                <Separator className="my-3 bg-border/30" />
                <div className="space-y-2.5 text-xs text-muted-foreground">
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
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
