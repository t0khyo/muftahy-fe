import * as React from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { getSummaryPlan, type ProductPlan } from '@workspace/domain/schemas/product'
import { useCartStore } from '../../cart/stores/cart-store'
import { resolveLocalizedName } from '../../cart/lib/cart-selectors'
import { useProduct } from '../hooks/use-products'
import { DetailBreadcrumb } from '../components/detail/detail-breadcrumb'
import { DetailMedia } from '../components/detail/detail-media'
import { DetailBuyBox } from '../components/detail/detail-buy-box'
import { DetailInfoSections } from '../components/detail/detail-info-sections'
import { DetailRelatedRail } from '../components/detail/detail-related-rail'
import { DetailStickyMobileBar } from '../components/detail/detail-sticky-mobile-bar'
import { DetailSkeleton } from '../components/detail/detail-skeleton'
import { DetailNotFound } from '../components/detail/detail-not-found'
import { DetailError } from '../components/detail/detail-error'

export function ProductDetailPage() {
  const { lang = 'ar', slug = '' } = useParams<{ lang: string; slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation(['detail', 'common'])

  const { data: product, isLoading, isError, refetch } = useProduct(slug)
  const cartItems = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)

  // Local UI feedback state
  const [isJustAdded, setIsJustAdded] = React.useState(false)
  const [liveAnnouncement, setLiveAnnouncement] = React.useState('')
  const feedbackTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sticky buy box & mobile bar refs
  const buyBoxContainerRef = React.useRef<HTMLDivElement | null>(null)
  const [isMobileBarVisible, setIsMobileBarVisible] = React.useState(false)

  // Resolve selected plan from searchParams and product.plans
  const queryPlanSlug = searchParams.get('plan')

  const selectedPlan: ProductPlan | null = React.useMemo(() => {
    if (!product) return null
    if (!product.plans || product.plans.length === 0) {
      return getSummaryPlan(product)
    }

    if (queryPlanSlug) {
      const match = product.plans.find((p) => p.slug === queryPlanSlug)
      if (match) return match
    }

    // Default to summaryPlan when query is absent or unknown
    return getSummaryPlan(product)
  }, [product, queryPlanSlug])

  // Normalize URL query parameter if missing or unknown
  React.useEffect(() => {
    if (!product || !selectedPlan) return

    if (queryPlanSlug !== selectedPlan.slug) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('plan', selectedPlan.slug)
      setSearchParams(nextParams, { replace: true })
    }
  }, [product, selectedPlan, queryPlanSlug, searchParams, setSearchParams])

  // Handle plan selection
  const handleSelectPlan = React.useCallback(
    (newPlanSlug: string) => {
      // Clear transient feedback when switching plans
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
      }
      setIsJustAdded(false)

      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('plan', newPlanSlug)
      setSearchParams(nextParams, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  // Check if selected plan is in cart
  const isInCart = React.useMemo(() => {
    if (!product || !selectedPlan) return false
    const itemId = `${product.id}:${selectedPlan.id}`
    return cartItems.some(
      (i) => i.id === itemId || (i.productId === product.id && i.planId === selectedPlan.id),
    )
  }, [product, selectedPlan, cartItems])

  // Handle Add To Cart
  const handleAddToCart = React.useCallback(() => {
    if (!product || !selectedPlan || selectedPlan.stock === 0) return

    addItem(
      {
        id: `${product.id}:${selectedPlan.id}`,
        productId: product.id,
        planId: selectedPlan.id,
        slug: product.slug,
        name: product.title,
        planName: selectedPlan.name,
        priceMinor: selectedPlan.price.amountMinor,
        currency: selectedPlan.price.currency,
      },
      1,
    )

    // Trigger visual feedback
    setIsJustAdded(true)
    const title = resolveLocalizedName(product.title, lang)
    const planName = resolveLocalizedName(selectedPlan.name, lang)
    setLiveAnnouncement(
      t('liveAddedAnnouncement', {
        product: `${title} (${planName})`,
        defaultValue: `${title} added to your cart`,
      }),
    )

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current)
    }
    feedbackTimerRef.current = setTimeout(() => {
      setIsJustAdded(false)
    }, 2000)
  }, [product, selectedPlan, addItem, lang, t])

  React.useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
      }
    }
  }, [])

  // Mobile Sticky Bar IntersectionObserver:
  // Shows sticky bar only when the buy box has passed entirely above the viewport
  React.useEffect(() => {
    const el = buyBoxContainerRef.current
    if (!el || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return
    }

    const checkVisibility = () => {
      const rect = el.getBoundingClientRect()
      // Only show when the bottom of buy box is above the viewport top
      setIsMobileBarVisible(rect.bottom < 0)
    }

    const observer = new IntersectionObserver(
      () => {
        checkVisibility()
      },
      { threshold: [0, 1] },
    )

    observer.observe(el)
    window.addEventListener('scroll', checkVisibility, { passive: true })
    window.addEventListener('resize', checkVisibility, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', checkVisibility)
      window.removeEventListener('resize', checkVisibility)
    }
  }, [product])

  if (isLoading) {
    return <DetailSkeleton />
  }

  if (isError) {
    return <DetailError onRetry={() => refetch()} />
  }

  if (!product || !selectedPlan) {
    return <DetailNotFound lang={lang} />
  }

  const productTitle = resolveLocalizedName(product.title, lang)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Polite Live Region for Assistive Technology Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* 1. Breadcrumb */}
      <DetailBreadcrumb
        category={product.category}
        productTitle={productTitle}
        lang={lang}
      />

      {/* 2. Top 12-Column Grid: Media (7) + Buy Box (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Media (7 columns) */}
        <div className="lg:col-span-7 w-full">
          <DetailMedia
            coverImage={product.coverImage}
            productTitle={productTitle}
            media={product.media}
            lang={lang}
          />
        </div>

        {/* Buy Box (5 columns) */}
        <div
          ref={buyBoxContainerRef}
          className="lg:col-span-5 w-full lg:sticky lg:top-24"
        >
          <DetailBuyBox
            product={product}
            selectedPlan={selectedPlan}
            onSelectPlan={handleSelectPlan}
            onAddToCart={handleAddToCart}
            isInCart={isInCart}
            isJustAdded={isJustAdded}
            lang={lang}
          />
        </div>
      </div>

      {/* 3. Lower Content Sections: What You Get, Activation, Specs, FAQ, Contact */}
      <DetailInfoSections product={product} lang={lang} />

      {/* 4. You May Also Like (Related Products Rail) */}
      <DetailRelatedRail
        currentSlug={product.slug}
        relatedSlugs={product.relatedSlugs}
        lang={lang}
      />

      {/* 5. Mobile Sticky Bottom Bar (Progressive enhancement below md) */}
      <DetailStickyMobileBar
        selectedPlan={selectedPlan}
        isVisible={isMobileBarVisible}
        isInCart={isInCart}
        isJustAdded={isJustAdded}
        onAddToCart={handleAddToCart}
        lang={lang}
      />
    </div>
  )
}
