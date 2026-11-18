import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Check, ShieldCheck, Headphones, Lock, ShoppingCart } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group'
import { formatMoneyFromMinor } from '@workspace/domain/formatters/money'
import type { Product, ProductPlan } from '@workspace/domain/schemas/product'
import { resolveLocalizedName } from '../../../cart/lib/cart-selectors'

export interface DetailBuyBoxProps {
  product: Product
  selectedPlan: ProductPlan
  onSelectPlan: (planSlug: string) => void
  onAddToCart: () => void
  isInCart: boolean
  isJustAdded: boolean
  lang: string
}

export function DetailBuyBox({
  product,
  selectedPlan,
  onSelectPlan,
  onAddToCart,
  isInCart,
  isJustAdded,
  lang,
}: DetailBuyBoxProps) {
  const { t } = useTranslation(['detail', 'products', 'common'])
  const navigate = useNavigate()

  const isRtl = lang === 'ar'
  const isOutOfStock = selectedPlan.stock === 0
  const isLowStock = selectedPlan.stock > 0 && selectedPlan.stock <= 5

  const productTitle = resolveLocalizedName(product.title, lang)
  const productTagline = resolveLocalizedName(product.tagline, lang)
  const regionNote = resolveLocalizedName(product.regionNote, lang)

  // Platform & Region localized labels
  const platformKey = `platform${product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}`
  const regionKey = `region${product.region.charAt(0).toUpperCase() + product.region.slice(1)}`
  const platformLabel = t(platformKey, { ns: 'products', defaultValue: product.platform })
  const regionLabel = t(regionKey, { ns: 'products', defaultValue: product.region })

  // Discount
  const hasDiscount = Boolean(
    selectedPlan.originalPrice &&
      selectedPlan.originalPrice.currency === selectedPlan.price.currency &&
      selectedPlan.originalPrice.amountMinor > selectedPlan.price.amountMinor,
  )

  const discountPercent = hasDiscount
    ? Math.round(
        ((selectedPlan.originalPrice!.amountMinor - selectedPlan.price.amountMinor) /
          selectedPlan.originalPrice!.amountMinor) *
          100,
      )
    : null

  const formattedPrice = formatMoneyFromMinor(
    selectedPlan.price.amountMinor,
    selectedPlan.price.currency,
    lang,
  )

  const formattedOriginalPrice = hasDiscount
    ? formatMoneyFromMinor(
        selectedPlan.originalPrice!.amountMinor,
        selectedPlan.originalPrice!.currency,
        lang,
      )
    : null

  const handleActionClick = () => {
    if (isOutOfStock) return
    if (isInCart) {
      navigate(`/${lang}/cart`)
      return
    }
    onAddToCart()
  }

  return (
    <div className="flex flex-col gap-5 text-start w-full">
      {/* 1. Badges & Region Note */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="h-7 px-3 text-xs font-medium">
            {platformLabel}
          </Badge>
          <Badge variant="outline" className="h-7 px-3 text-xs font-medium">
            {regionLabel}
          </Badge>
          {product.featured && (
            <Badge variant="default" className="h-7 px-3 text-xs font-medium">
              {t('bestSeller', { ns: 'products', defaultValue: isRtl ? 'الأكثر مبيعاً' : 'Best Seller' })}
            </Badge>
          )}
        </div>

        {regionNote && (
          <div className="rounded-xl bg-muted/60 border border-border/50 px-3.5 py-2 text-xs text-muted-foreground leading-relaxed">
            {regionNote}
          </div>
        )}
      </div>

      {/* 2. Title & Tagline */}
      <div className="space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground leading-tight line-clamp-3">
          {productTitle}
        </h1>
        {productTagline && (
          <p className="text-base text-muted-foreground leading-relaxed">
            {productTagline}
          </p>
        )}
      </div>

      {/* 3. Plan Picker (Radio Group - only if 2+ plans) */}
      {product.plans && product.plans.length > 1 && (
        <fieldset className="space-y-2.5">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('choosePlan')}
          </legend>
          <RadioGroup
            value={selectedPlan.slug}
            onValueChange={(val) => {
              if (val) onSelectPlan(val)
            }}
            className="grid gap-2.5"
          >
            {product.plans.map((plan) => {
              const isSelected = plan.slug === selectedPlan.slug
              const isPlanDisabled = plan.stock === 0
              const planName = resolveLocalizedName(plan.name, lang)
              const planPrice = formatMoneyFromMinor(
                plan.price.amountMinor,
                plan.price.currency,
                lang,
              )

              return (
                <label
                  key={plan.slug}
                  className={cn(
                    'relative flex items-center justify-between rounded-xl border p-3.5 sm:p-4 cursor-pointer transition-all select-none',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-input hover:border-border bg-card',
                    isPlanDisabled && 'opacity-60 cursor-not-allowed',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem
                      value={plan.slug}
                      disabled={isPlanDisabled}
                      aria-label={`${planName} - ${planPrice}`}
                    />
                    <div>
                      <span className="font-medium text-sm sm:text-base text-foreground block">
                        {planName}
                      </span>
                      {isPlanDisabled && (
                        <span className="text-xs text-destructive">
                          {t('outOfStock')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-foreground tabular-nums">
                    {planPrice}
                  </span>
                </label>
              )
            })}
          </RadioGroup>
        </fieldset>
      )}

      {/* 4. Price & Discount Row */}
      <div className="flex flex-wrap items-baseline gap-3 pt-2">
        <span className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums tracking-tight">
          {formattedPrice}
        </span>
        {hasDiscount && (
          <>
            <span className="text-base text-muted-foreground line-through tabular-nums">
              {formattedOriginalPrice}
            </span>
            <Badge variant="destructive" className="h-6 px-2 text-xs font-bold">
              -{discountPercent}%
            </Badge>
          </>
        )}
      </div>

      {/* 5. Delivery Line & Low Stock */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span className="font-medium text-foreground">
            {t('instantDelivery')}
          </span>
          <span>•</span>
          <span>
            {isRtl ? 'عبر البريد الإلكتروني والحساب' : 'Via email & dashboard'}
          </span>
        </div>

        {isLowStock && (
          <div className="text-warning font-medium">
            {t('lowStock')} ({t('lowStock', { ns: 'products', count: selectedPlan.stock })})
          </div>
        )}
      </div>

      {/* 6. Purchase Action Button */}
      <div className="space-y-2 pt-2">
        <Button
          type="button"
          size="lg"
          disabled={isOutOfStock}
          onClick={handleActionClick}
          className={cn(
            'w-full h-12 rounded-full font-medium text-base transition-all active:scale-[0.98] shadow-sm',
            isInCart
              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
        >
          {isOutOfStock ? (
            t('outOfStock')
          ) : isJustAdded ? (
            <span className="flex items-center gap-2">
              <Check className="size-5" />
              {t('added')}
            </span>
          ) : isInCart ? (
            <span className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              {t('inCart')}
            </span>
          ) : (
            t('addToCart')
          )}
        </Button>

        {isInCart && (
          <div className="text-center">
            <Link
              to={`/${lang}/cart`}
              className="text-xs text-primary underline underline-offset-4 hover:text-primary/80 transition-colors font-medium inline-block py-1"
            >
              {t('viewCart')}
            </Link>
          </div>
        )}
      </div>

      {/* 7. Trust Stamp Grid (3 distinct badges, no duplicate delivery claim) */}
      <div className="grid grid-cols-3 gap-px bg-border/40 border border-border/40 rounded-xl overflow-hidden mt-2">
        <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 bg-secondary/30 text-center">
          <ShieldCheck className="size-4 text-primary shrink-0" aria-hidden="true" />
          <span className="text-[11px] leading-tight text-muted-foreground font-medium">
            {t('verifiedLicense', { defaultValue: isRtl ? 'ترخيص رسمي' : 'Official license' })}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 bg-secondary/30 text-center">
          <Headphones className="size-4 text-primary shrink-0" aria-hidden="true" />
          <span className="text-[11px] leading-tight text-muted-foreground font-medium">
            {t('activationSupport', { defaultValue: isRtl ? 'دعم التفعيل' : 'Activation support' })}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 bg-secondary/30 text-center">
          <Lock className="size-4 text-primary shrink-0" aria-hidden="true" />
          <span className="text-[11px] leading-tight text-muted-foreground font-medium">
            {t('buyerProtection', { defaultValue: isRtl ? 'حماية المشتري' : 'Buyer protection' })}
          </span>
        </div>
      </div>
    </div>
  )
}
