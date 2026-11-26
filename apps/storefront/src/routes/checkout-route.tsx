import * as React from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Zap,
} from 'lucide-react'
import { formatMoney } from '@workspace/domain/formatters/money'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Card } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@workspace/ui/components/empty'
import { PaymentMethodLogo } from '../components/payment-method-logo'
import { useAuth } from '../features/auth/hooks/use-auth'
import {
  useApplyPromoCode,
  useCart,
  useCheckout,
} from '../features/cart/hooks/use-cart'

export function CheckoutRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['checkout', 'cart', 'common', 'header'])
  const isRtl = lang === 'ar' || i18n.dir() === 'rtl'

  const { isAuthenticated, user, isInitializing } = useAuth()
  const cart = useCart()
  const { mutateAsync: checkoutMutation, isPending: isCheckingOut } = useCheckout()
  const { mutateAsync: validatePromoMutation, isPending: isCheckingPromo } = useApplyPromoCode()

  const initialPromo = searchParams.get('promo') ?? ''
  const [promoCode, setPromoCode] = React.useState(initialPromo)
  const [promoDiscount, setPromoDiscount] = React.useState<number | null>(null)
  const [finalTotal, setFinalTotal] = React.useState<number | null>(null)
  const [promoError, setPromoError] = React.useState<string | null>(null)

  const [agreedToTerms, setAgreedToTerms] = React.useState(true)
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null)

  // Validate initial promo code if passed from cart route
  React.useEffect(() => {
    if (initialPromo && isAuthenticated) {
      validatePromoMutation(initialPromo)
        .then((res) => {
          if (res.valid) {
            setPromoDiscount(res.total_discount)
            setFinalTotal(res.final_total)
          }
        })
        .catch(() => {
          // ignore initial auto-validation error
        })
    }
  }, [initialPromo, isAuthenticated, validatePromoMutation])

  if (isInitializing) {
    return (
      <main className="site-container py-12 flex justify-center items-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </main>
    )
  }

  // Guard: unauthenticated customers must log in
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/${lang}/login?returnTo=/${lang}/checkout`}
        replace
      />
    )
  }

  const items = cart.items
  const hasItems = items.length > 0

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

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckoutError(null)

    if (!agreedToTerms) {
      setCheckoutError(
        isRtl
          ? 'يرجى الموافقة على شروط التسليم الرقمي للمتابعة'
          : 'Please agree to the digital delivery terms to proceed',
      )
      return
    }

    try {
      const order = await checkoutMutation(
        promoDiscount !== null && promoCode.trim()
          ? { promo_code: promoCode.trim() }
          : undefined,
      )

      // Redirect immediately to order detail page
      navigate(`/${lang}/account/orders/${order.id}?new=true`, { replace: true })
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isRtl
            ? 'حدث خطأ أثناء إنشاء الطلب. يُرجى المحاولة مرة أخرى.'
            : 'An error occurred while creating your order. Please try again.'
      setCheckoutError(msg)
    }
  }

  const formattedSubtotal = formatMoney(cart.subtotal_egp, { currency: 'EGP', locale: lang })
  const formattedDiscount = promoDiscount
    ? formatMoney(promoDiscount, { currency: 'EGP', locale: lang })
    : null
  const formattedTotal = formatMoney(finalTotal ?? cart.subtotal_egp, {
    currency: 'EGP',
    locale: lang,
  })

  return (
    <main id="main" className="site-container py-8 sm:py-12">
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="text-start">
          <Link
            to={`/${lang}/cart`}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            {isRtl ? (
              <ArrowRight className="size-4 group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            )}
            <span>{t('backToCart', { ns: 'checkout', defaultValue: 'Back to bag' })}</span>
          </Link>
        </div>

        {/* Empty State */}
        {!hasItems ? (
          <Empty className="border border-dashed border-border/70 bg-card/40 max-w-xl mx-auto p-8 sm:p-16">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-20 rounded-2xl bg-secondary/60 border border-border/40 mb-2">
                <ShoppingBag className="size-10 text-muted-foreground" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                <h2>{t('yourBagIsEmpty', { ns: 'cart', defaultValue: 'Your bag is empty' })}</h2>
              </EmptyTitle>
              <EmptyDescription className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
                {t('findNext', {
                  ns: 'cart',
                  defaultValue: 'Find your next game, license, or subscription.',
                })}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="pt-4 flex justify-center">
              <Button
                nativeButton={false}
                render={<Link to={`/${lang}/products`} />}
                variant="default"
                className="h-12 px-8 rounded-full font-medium text-sm"
              >
                {t('exploreProducts', { ns: 'cart', defaultValue: 'Explore products' })}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Customer details & Offline Payment Instructions */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-6 text-start">
              {/* Customer Account Info */}
              <Card className="rounded-2xl border-border/60 bg-card p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-foreground">
                  {isRtl ? 'بيانات الحساب والتسليم' : 'Customer & Delivery Account'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="min-w-0">
                    <Label className="text-xs text-muted-foreground">{isRtl ? 'الاسم' : 'Full Name'}</Label>
                    <p className="font-semibold text-foreground mt-0.5 break-words">{user?.full_name || 'Customer'}</p>
                  </div>
                  <div className="min-w-0">
                    <Label className="text-xs text-muted-foreground">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</Label>
                    <p className="font-semibold text-foreground mt-0.5 break-all">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 text-xs text-primary font-medium">
                  <Zap className="size-4 shrink-0 fill-primary/20" />
                  <span>
                    {isRtl
                      ? 'سيتم إرسال المفاتيح الرقمية إلى بريدك الإلكتروني فور تأكيد الدفع'
                      : 'Digital keys are delivered to your email upon payment confirmation'}
                  </span>
                </div>
              </Card>

              {/* Payment Method Notice: Offline Receipt */}
              <Card className="rounded-2xl border-border/60 bg-card p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="size-5 text-primary" />
                  <span>{isRtl ? 'طريقة الدفع: تحويل محلي (مصر)' : 'Payment Method: Local Transfer (Egypt)'}</span>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isRtl
                    ? 'يتم الدفع عبر المحافظ الإلكترونية (فودافون كاش، أورنج كاش، اتصالات كاش) أو تطبيق إنستاباي (InstaPay). بعد تأكيد الطلب، ستظهر لك أرقام التحويل المباشرة ورمز المعاملة المرجعي، مع إمكانية رفع صورة إيصال التحويل مباشرة.'
                    : 'Payment is completed via electronic mobile wallets (Vodafone Cash, Orange, Etisalat) or InstaPay. Upon order confirmation, direct transfer details and reference code will be displayed to upload your transfer receipt.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/30 flex items-center gap-3">
                    <PaymentMethodLogo method="vodafone_cash" decorative />
                    <div>
                      <div className="text-xs font-semibold text-foreground">{isRtl ? 'فودافون كاش' : 'Vodafone Cash'}</div>
                      <div className="text-[11px] text-muted-foreground">{isRtl ? 'محافظ الهاتف المحمول' : 'Mobile Wallets'}</div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/30 flex items-center gap-3">
                    <PaymentMethodLogo method="instapay" decorative />
                    <div>
                      <div className="text-xs font-semibold text-foreground">{isRtl ? 'إنستاباي' : 'InstaPay'}</div>
                      <div className="text-[11px] text-muted-foreground">{isRtl ? 'تحويل بنكي لحظي' : 'Instant Bank Transfer'}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Terms Checkbox & Error Banner */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-secondary/20">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                    {isRtl
                      ? 'أوافق على شروط الخدمة وسياسة الاسترجاع الخاصة بالمفاتيح والمنتجات الرقمية. يتم قفل المفتاح للطلب بعد مراجعة إيصال التحويل.'
                      : 'I agree to the terms of service and digital key delivery policy. Inventory is allocated upon payment receipt verification.'}
                  </Label>
                </div>

                {checkoutError && (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    <AlertDescription className="text-xs">{checkoutError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Right Column: Order Review & Checkout Confirmation */}
            <div className="lg:col-span-5 xl:col-span-5 sticky top-24 space-y-4 text-start">
              <Card className="rounded-2xl border-border/60 bg-card p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-foreground">
                  {isRtl ? 'مراجعة الطلب' : 'Order Review'}
                </h2>

                {/* Line Items List */}
                <ul className="divide-y divide-border/40 max-h-64 overflow-y-auto space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-foreground line-clamp-1">
                          {item.product_name}
                        </span>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{isRtl ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}</span>
                          {item.is_preorder && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-amber-500/40 text-amber-600">
                              {isRtl ? 'طلب مسبق' : 'Preorder'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-foreground tabular-nums shrink-0">
                        {formatMoney(item.unit_price * item.quantity, { currency: 'EGP', locale: lang })}
                      </span>
                    </li>
                  ))}
                </ul>

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

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <Separator className="my-2 bg-border/40" />

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{t('subtotal', { ns: 'cart', defaultValue: 'Subtotal' })}</span>
                    <span className="font-medium text-foreground tabular-nums">{formattedSubtotal}</span>
                  </div>

                  {formattedDiscount && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>{t('discount', { ns: 'cart', defaultValue: 'Discount' })}</span>
                      <span className="tabular-nums">- {formattedDiscount}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Zap className="size-3.5 text-primary fill-primary/20" />
                      <span>{t('freeInstantDelivery', { ns: 'cart', defaultValue: 'Free Instant Delivery' })}</span>
                    </span>
                    <span className="text-primary font-semibold">{isRtl ? 'مجاني' : 'FREE'}</span>
                  </div>

                  <Separator className="my-2 bg-border/40" />

                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-semibold text-foreground">
                      {t('total', { ns: 'cart', defaultValue: 'Total' })}
                    </span>
                    <span className="text-2xl font-bold text-foreground tabular-nums">
                      {formattedTotal}
                    </span>
                  </div>
                </div>

                {/* Confirm Order CTA */}
                <Button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isCheckingOut || !agreedToTerms}
                  className="w-full h-12 rounded-full font-medium text-sm active:scale-[0.98] transition-transform shadow-sm"
                >
                  {isCheckingOut ? (
                    <div className="flex items-center gap-2">
                      <div className="size-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                      <span>{isRtl ? 'جارٍ تأكيد الطلب...' : 'Confirming Order...'}</span>
                    </div>
                  ) : (
                    <span>{isRtl ? 'تأكيد الطلب والانتقال للدفع' : 'Confirm Order & Proceed to Payment'}</span>
                  )}
                </Button>

                {/* Trust Seals */}
                <div className="pt-3 border-t border-border/30 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary shrink-0" />
                    <span>{isRtl ? 'مفاتيح رسمية أصلية 100%' : '100% Genuine Official License Keys'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-primary shrink-0" />
                    <span>{isRtl ? 'حجز فوري للمفاتيح لمدة 24 ساعة' : 'Instant 24-hour inventory hold upon checkout'}</span>
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
