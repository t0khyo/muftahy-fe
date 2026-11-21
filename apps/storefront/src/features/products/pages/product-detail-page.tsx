import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useCart, useAddToCart } from '../../cart/hooks/use-cart'
import { useProduct } from '../hooks/use-products'
import { resolveProductImage } from '../utils/asset-resolver'
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
  const { lang = 'ar', id = '' } = useParams<{ lang: string; id: string }>()
  const { t } = useTranslation(['detail', 'common'])

  const { data: product, isLoading, isError, refetch } = useProduct(id)
  const cart = useCart()
  const { mutate: addToCart } = useAddToCart()

  const [isJustAdded, setIsJustAdded] = React.useState(false)
  const [liveAnnouncement, setLiveAnnouncement] = React.useState('')
  const feedbackTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const buyBoxContainerRef = React.useRef<HTMLDivElement | null>(null)
  const [isMobileBarVisible, setIsMobileBarVisible] = React.useState(false)

  const isInCart = React.useMemo(() => {
    if (!product) return false
    return cart.items.some((i) => i.product_id === product.id || i.id === product.id)
  }, [product, cart.items])

  const coverImageUrl = product
    ? resolveProductImage(product.category, product.variant)
    : ''

  const handleAddToCart = React.useCallback(() => {
    if (!product || (product.stock_status === 'out_of_stock' && !product.preorder_enabled)) return

    const isPreorder = product.stock_status === 'preorder'

    addToCart({
      productId: product.id,
      productName: product.name,
      unitPrice: Number(product.effective_price),
      isPreorder,
      quantity: 1,
    })

    setIsJustAdded(true)
    setLiveAnnouncement(
      t('liveAddedAnnouncement', {
        product: product.name,
        defaultValue: `${product.name} added to your cart`,
      }),
    )

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current)
    }
    feedbackTimerRef.current = setTimeout(() => {
      setIsJustAdded(false)
    }, 2000)
  }, [product, addToCart, t])

  React.useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    const el = buyBoxContainerRef.current
    if (!el || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return
    }

    const checkVisibility = () => {
      const rect = el.getBoundingClientRect()
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

  if (!product) {
    return <DetailNotFound lang={lang} />
  }

  return (
    <div className="site-container py-8 sm:py-10">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      <DetailBreadcrumb
        category={product.category}
        productTitle={product.name}
        lang={lang}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7 w-full">
          <DetailMedia
            coverImage={coverImageUrl}
            productTitle={product.name}
            lang={lang}
          />
        </div>

        <div
          ref={buyBoxContainerRef}
          className="lg:col-span-5 w-full lg:sticky lg:top-24"
        >
          <DetailBuyBox
            product={product}
            onAddToCart={handleAddToCart}
            isInCart={isInCart}
            isJustAdded={isJustAdded}
            lang={lang}
          />
        </div>
      </div>

      <div className="border-t border-border/40 mt-12 sm:mt-16 pt-10 sm:pt-14">
        <DetailInfoSections product={product} lang={lang} />
      </div>

      <DetailRelatedRail
        currentId={product.id}
        category={product.category}
        lang={lang}
      />

      <DetailStickyMobileBar
        product={product}
        isVisible={isMobileBarVisible}
        isInCart={isInCart}
        isJustAdded={isJustAdded}
        onAddToCart={handleAddToCart}
        lang={lang}
      />
    </div>
  )
}
