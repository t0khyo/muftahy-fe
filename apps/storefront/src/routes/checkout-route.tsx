import * as React from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Headphones,
  KeyRound,
  Lock,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react'
import { formatMoneyFromMinor } from '@workspace/domain/formatters/money'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group'
import { resolveLocalizedName, getCurrencySubtotals } from '../features/cart/lib/cart-selectors'
import { useCartStore, type CartItem } from '../features/cart/stores/cart-store'

export function CheckoutRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t, i18n } = useTranslation(['checkout', 'cart', 'common', 'header'])
  const isRtl = lang === 'ar' || i18n.dir() === 'rtl'

  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clear)

  // Form State
  const [email, setEmail] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [paymentMethod, setPaymentMethod] = React.useState<'card' | 'apple-pay' | 'local'>('card')
  const [agreedToTerms, setAgreedToTerms] = React.useState(true)
  const [cardNumber, setCardNumber] = React.useState('')
  const [cardExpiry, setCardExpiry] = React.useState('')
  const [cardCvc, setCardCvc] = React.useState('')

  // Validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Order Placement & Post-Payment Reveal State
  const [isOrderPlaced, setIsOrderPlaced] = React.useState(false)
  const [placedOrderNumber, setPlacedOrderNumber] = React.useState('')
  const [purchasedItems, setPurchasedItems] = React.useState<CartItem[]>([])
  const [revealedKeys, setRevealedKeys] = React.useState<Record<string, boolean>>({})
  const [copiedKeyId, setCopiedKeyId] = React.useState<string | null>(null)

  const currencySubtotals = React.useMemo(() => {
    return getCurrencySubtotals(isOrderPlaced ? purchasedItems : items, lang)
  }, [isOrderPlaced, purchasedItems, items, lang])

  // Explicit Reveal & Copy Safe Mock Key Pattern (AGENTS.md)
  const SAFE_MOCK_KEY = 'XXXXX-XXXXX-XXXXX'

  const toggleRevealKey = (itemId: string) => {
    setRevealedKeys((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const handleCopyKey = (itemId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(SAFE_MOCK_KEY)
      setCopiedKeyId(itemId)
      setTimeout(() => setCopiedKeyId(null), 2000)
    }
  }

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = t('requiredField', { defaultValue: 'This field is required' })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = t('invalidEmail', { defaultValue: 'Please enter a valid email address' })
    }

    if (!fullName.trim()) {
      newErrors.fullName = t('requiredField', { defaultValue: 'This field is required' })
    }

    if (!agreedToTerms) {
      newErrors.terms = t('agreeToTerms', {
        defaultValue: 'You must agree to the digital delivery terms to proceed',
      })
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    // Simulate secure transaction latency
    setTimeout(() => {
      const orderNum = `MUF-${Math.floor(100000 + Math.random() * 900000)}`
      setPlacedOrderNumber(orderNum)
      setPurchasedItems([...items])
      clearCart()
      setIsSubmitting(false)
      setIsOrderPlaced(true)
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 600)
  }

  // ── Render Case A: Order Confirmation & Key Reveal Screen ──
  if (isOrderPlaced) {
    return (
      <main id="main" className="site-container py-8 sm:py-14 text-start">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Success Hero Header */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8 text-center space-y-4">
            <div className="mx-auto size-16 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <CheckCircle2 className="size-9" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {t('orderSuccess', { defaultValue: 'Order Placed Successfully!' })}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {t('orderNumber', { defaultValue: 'Order Number' })}: {placedOrderNumber}
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto pt-1 leading-relaxed">
                {t('emailSentTo', {
                  defaultValue: "We've sent your official receipt and activation details to",
                })}{' '}
                <strong className="text-foreground font-semibold">{email}</strong>
              </p>
            </div>
          </div>

          {/* Purchased Keys & Reveal Pattern */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-5 text-primary" aria-hidden="true" />
                <span>{t('yourPurchasedKeys', { defaultValue: 'Your Digital License Keys' })}</span>
              </h2>
              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                {purchasedItems.length} {purchasedItems.length === 1 ? 'Key' : 'Keys'}
              </Badge>
            </div>

            <div className="space-y-4">
              {purchasedItems.map((item) => {
                const isRevealed = Boolean(revealedKeys[item.id])
                const isCopied = copiedKeyId === item.id
                const title = resolveLocalizedName(item.name, lang)
                const plan = resolveLocalizedName(item.planName, lang)

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground text-base sm:text-lg">
                          {title}
                        </h3>
                        {plan && (
                          <div className="text-xs text-muted-foreground font-medium">
                            {plan}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {item.quantity}x
                      </Badge>
                    </div>

                    {/* Sensitive Key Box with Reveal & Copy */}
                    <div className="rounded-xl border border-border/80 bg-secondary/40 p-4 space-y-3">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('productKey', { defaultValue: 'Product License Key' })}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="font-mono text-base sm:text-lg font-bold tracking-widest text-foreground select-all bg-background/80 px-4 py-2 rounded-lg border border-border/60 tabular-nums">
                          {isRevealed ? SAFE_MOCK_KEY : '•••••-•••••-•••••'}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRevealKey(item.id)}
                            className="h-10 px-3.5 rounded-lg text-xs gap-1.5 cursor-pointer"
                            aria-label={isRevealed ? t('hideCode') : t('revealCode')}
                          >
                            {isRevealed ? (
                              <>
                                <EyeOff className="size-3.5" aria-hidden="true" />
                                <span>{t('hideCode', { defaultValue: 'Hide code' })}</span>
                              </>
                            ) : (
                              <>
                                <Eye className="size-3.5" aria-hidden="true" />
                                <span>{t('revealCode', { defaultValue: 'Reveal code' })}</span>
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            disabled={!isRevealed}
                            onClick={() => handleCopyKey(item.id)}
                            className="h-10 px-4 rounded-lg text-xs gap-1.5 cursor-pointer active:scale-95 transition-transform"
                          >
                            {isCopied ? (
                              <>
                                <Check className="size-3.5 text-primary-foreground" aria-hidden="true" />
                                <span>{t('copied', { defaultValue: 'Copied!' })}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3.5" aria-hidden="true" />
                                <span>{t('copyCode', { defaultValue: 'Copy key' })}</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground pt-1">
                        {t('keyNotice', {
                          defaultValue:
                            'Treat this digital key as sensitive. Activate it following the guide below.',
                        })}
                      </p>
                    </div>

                    {/* Activation & Support row */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <Link
                        to={`/${lang}/products/${item.slug}`}
                        className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <span>{t('viewActivationGuide', { defaultValue: 'View Activation Guide' })}</span>
                        {isRtl ? (
                          <ArrowLeft className="size-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowRight className="size-3.5" aria-hidden="true" />
                        )}
                      </Link>

                      <a
                        href="https://wa.me/201000000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="size-3.5 text-emerald-500" aria-hidden="true" />
                        <span>{t('supportWhatsApp', { defaultValue: 'Need help? WhatsApp Support' })}</span>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              nativeButton={false}
              render={<Link to={`/${lang}/products`} />}
              variant="default"
              className="w-full sm:w-auto h-12 px-8 rounded-full font-medium text-sm active:scale-[0.98] transition-transform"
            >
              {t('backToStore', { defaultValue: 'Continue Shopping' })}
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // ── Render Case B: Empty Cart Prompt on Checkout ──
  if (items.length === 0) {
    return (
      <main id="main" className="site-container py-16 sm:py-24 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="mx-auto size-20 rounded-2xl bg-secondary/60 border border-border/40 flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="size-10" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t('emptyTitle', { ns: 'cart', defaultValue: 'Your bag is empty' })}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('emptyCheckoutPrompt', {
                defaultValue: 'Your bag is empty. Please add items before checking out.',
              })}
            </p>
          </div>

          <Button
            nativeButton={false}
            render={<Link to={`/${lang}/products`} />}
            variant="default"
            className="h-12 px-8 rounded-full font-medium text-sm active:scale-[0.98] transition-transform"
          >
            {t('exploreProducts', { ns: 'cart', defaultValue: 'Explore products' })}
          </Button>
        </div>
      </main>
    )
  }

  // ── Render Case C: Active Checkout Surface ──
  return (
    <main id="main" className="site-container py-8 sm:py-12 text-start">
      <div className="space-y-8">
        {/* Checkout Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6">
          <Link
            to={`/${lang}/cart`}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            {isRtl ? (
              <ArrowRight className="size-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
            ) : (
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
            )}
            <span>{t('returnToCart', { defaultValue: 'Return to bag' })}</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-secondary/40 border border-border/60 px-3.5 py-1.5 rounded-full">
            <Lock className="size-3.5 text-primary" aria-hidden="true" />
            <span>{t('encryptedCheckout', { defaultValue: '256-bit Encrypted Checkout' })}</span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* 1 ── Main Checkout Form (7-col) */}
          <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 xl:col-span-7 space-y-8">
            {/* Step 1: Customer Contact & Delivery Email */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  {t('contactInfo', { defaultValue: 'Customer & Delivery Details' })}
                </h2>
              </div>

              <div className="space-y-4 pt-1">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-email" className="text-xs font-semibold text-foreground">
                    {t('deliveryEmail', { defaultValue: 'Delivery Email Address' })} *
                  </Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('deliveryEmailPlaceholder', { defaultValue: 'you@example.com' })}
                    className={`h-11 rounded-xl text-sm ${errors.email ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                    aria-describedby="email-help"
                  />
                  <p id="email-help" className="text-xs text-muted-foreground">
                    {t('deliveryEmailHelp', {
                      defaultValue:
                        'Your digital license keys and receipt will be delivered to this email.',
                    })}
                  </p>
                  {errors.email && (
                    <p className="text-xs font-medium text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-name" className="text-xs font-semibold text-foreground">
                    {t('fullName', { defaultValue: 'Full Name' })} *
                  </Label>
                  <Input
                    id="checkout-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('fullNamePlaceholder', { defaultValue: 'Alex Morgan' })}
                    className={`h-11 rounded-xl text-sm ${errors.fullName ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                  />
                  {errors.fullName && (
                    <p className="text-xs font-medium text-destructive">{errors.fullName}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-phone" className="text-xs font-semibold text-foreground">
                    {t('phoneNumber', { defaultValue: 'Phone Number (optional)' })}
                  </Label>
                  <Input
                    id="checkout-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('phoneNumberPlaceholder', { defaultValue: '+966 5X XXX XXXX' })}
                    className="h-11 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  {t('paymentMethod', { defaultValue: 'Payment Method' })}
                </h2>
              </div>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as 'card' | 'apple-pay' | 'local')}
                className="gap-3 pt-1"
              >
                {/* Option 1: Card (Mada, Visa, MC, KNET) */}
                <label
                  htmlFor="payment-card"
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border/60 hover:bg-secondary/40'
                  }`}
                >
                  <RadioGroupItem value="card" id="payment-card" className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">
                        {t('creditCard', { defaultValue: 'Credit / Debit Card' })}
                      </span>
                      <CreditCard className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('creditCardDesc', { defaultValue: 'Visa, Mastercard, Mada, KNET' })}
                    </p>
                  </div>
                </label>

                {/* Option 2: Apple Pay / Google Pay */}
                <label
                  htmlFor="payment-apple"
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'apple-pay'
                      ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border/60 hover:bg-secondary/40'
                  }`}
                >
                  <RadioGroupItem value="apple-pay" id="payment-apple" className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">
                        {t('applePay', { defaultValue: 'Apple Pay / Google Pay' })}
                      </span>
                      <Smartphone className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('applePayDesc', { defaultValue: 'Fast and secure one-click checkout' })}
                    </p>
                  </div>
                </label>

                {/* Option 3: Regional Instant Payment */}
                <label
                  htmlFor="payment-local"
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'local'
                      ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border/60 hover:bg-secondary/40'
                  }`}
                >
                  <RadioGroupItem value="local" id="payment-local" className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">
                        {t('localPayment', { defaultValue: 'Regional Instant Payment' })}
                      </span>
                      <Zap className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('localPaymentDesc', { defaultValue: 'KNET, Mada, Fawry, InstaPay' })}
                    </p>
                  </div>
                </label>
              </RadioGroup>

              {/* Conditional Card Fields when Card is selected */}
              {paymentMethod === 'card' && (
                <div className="pt-3 border-t border-border/40 space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="checkout-card-num" className="text-xs font-semibold text-foreground">
                      {t('cardNumber', { defaultValue: 'Card Number' })}
                    </Label>
                    <Input
                      id="checkout-card-num"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder={t('cardNumberPlaceholder', { defaultValue: '•••• •••• •••• ••••' })}
                      className="h-11 rounded-xl text-sm font-mono tabular-nums"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-expiry" className="text-xs font-semibold text-foreground">
                        {t('expires', { defaultValue: 'Expires' })}
                      </Label>
                      <Input
                        id="checkout-expiry"
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder={t('expiresPlaceholder', { defaultValue: 'MM/YY' })}
                        className="h-11 rounded-xl text-sm font-mono tabular-nums"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-cvc" className="text-xs font-semibold text-foreground">
                        {t('cvc', { defaultValue: 'CVC' })}
                      </Label>
                      <Input
                        id="checkout-cvc"
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder={t('cvcPlaceholder', { defaultValue: '123' })}
                        className="h-11 rounded-xl text-sm font-mono tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Digital Delivery Agreement & CTA */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-start">
                <Checkbox
                  id="checkout-terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
                  className="mt-1"
                />
                <Label
                  htmlFor="checkout-terms"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
                >
                  {t('digitalTerms', {
                    defaultValue:
                      'I understand that digital codes are revealed immediately and agree to the digital goods delivery terms.',
                  })}
                </Label>
              </div>
              {errors.terms && (
                <p className="text-xs font-medium text-destructive">{errors.terms}</p>
              )}

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-full font-medium text-sm active:scale-[0.98] transition-transform shadow-md"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>{t('processingOrder', { defaultValue: 'Processing your secure order...' })}</span>
                  </span>
                ) : (
                  <span>{t('completeOrder', { defaultValue: 'Complete Order & Receive Keys' })}</span>
                )}
              </Button>
            </div>
          </form>

          {/* 2 ── Order Review Sidebar (5-col) */}
          <aside className="lg:col-span-5 xl:col-span-5 sticky top-24 space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-6 text-start">
              <h2 className="text-xl font-bold text-foreground">
                {t('orderReview', { defaultValue: 'Order Review' })}
              </h2>

              {/* Item Previews */}
              <div className="space-y-3 max-h-72 overflow-y-auto divide-y divide-border/20 pe-1">
                {items.map((item) => {
                  const title = resolveLocalizedName(item.name, lang)
                  const lineTotal = formatMoneyFromMinor(
                    item.priceMinor * item.quantity,
                    item.currency,
                    lang,
                  )

                  return (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-11 shrink-0 rounded-lg overflow-hidden bg-secondary/60 border border-border/40 flex items-center justify-center">
                          {item.coverImage ? (
                            <img src={item.coverImage} alt="" className="size-full object-cover" />
                          ) : (
                            <KeyRound className="size-5 text-muted-foreground" aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground block truncate">
                            {title}
                          </span>
                          <span className="text-muted-foreground">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-semibold text-foreground tabular-nums shrink-0">
                        {lineTotal}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Totals Breakdown */}
              <div className="border-t border-border/40 pt-4 space-y-2 text-sm">
                {/* Instant Delivery */}
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

                {/* Subtotal / Grand Total */}
                <div className="pt-2 border-t border-border/40 space-y-1">
                  {currencySubtotals.map((sub) => (
                    <div key={sub.currency} className="flex items-baseline justify-between">
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

              {/* Guarantee Stamps */}
              <div className="pt-3 border-t border-border/30 space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary shrink-0" aria-hidden="true" />
                  <span>{isRtl ? 'ضمان استرداد فوري في حال وجود أي مشكلة' : 'Instant warranty replacement guarantee'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-primary shrink-0" aria-hidden="true" />
                  <span>{isRtl ? 'ظهور المفاتيح فوراً على الشاشة' : 'Keys revealed on-screen immediately'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Headphones className="size-4 text-primary shrink-0" aria-hidden="true" />
                  <span>{isRtl ? 'فريق دعم متواجد عبر واتساب' : 'Live WhatsApp assistance available'}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
