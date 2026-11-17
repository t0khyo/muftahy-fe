import * as React from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import type { ProductCollection } from '@workspace/domain/schemas/product'
import { useProductCollection } from '../hooks/use-product-collection'
import { ProductCard } from './product-card'
import { ProductRailSkeleton } from './product-rail-skeleton'

export interface ProductRailProps {
  id: string
  collection: ProductCollection
  titleKey: string
  viewAllHref: string
  className?: string
}

const CARDS_PER_PAGE_DESKTOP = 4

export function ProductRail({
  id,
  collection,
  titleKey,
  viewAllHref,
  className = '',
}: ProductRailProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const { t } = useTranslation(['home', 'common'])

  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useProductCollection({ collection })

  const headingId = `${id}-heading`

  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([])

  const totalCards = products?.length ?? 0
  const desktopPages = Math.max(1, Math.ceil(totalCards / CARDS_PER_PAGE_DESKTOP))

  const [activeCardIndex, setActiveCardIndex] = React.useState(0)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(desktopPages > 1)

  const activeDesktopPage = Math.min(
    desktopPages - 1,
    Math.floor(activeCardIndex / CARDS_PER_PAGE_DESKTOP),
  )

  const handleScroll = React.useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    const maxScroll = scrollWidth - clientWidth

    // In jsdom or headless environments without layout geometry, fallback to card/page index
    if (scrollWidth === 0 && clientWidth === 0) {
      setCanScrollPrev(activeCardIndex > 0)
      setCanScrollNext(activeCardIndex < totalCards - 1)
      return
    }

    if (maxScroll <= 1) {
      setCanScrollPrev(false)
      setCanScrollNext(false)
      setActiveCardIndex(0)
      return
    }

    const currentScroll = Math.abs(scrollLeft)
    setCanScrollPrev(currentScroll > 4)
    setCanScrollNext(currentScroll < maxScroll - 4)

    const progress = Math.min(1, Math.max(0, currentScroll / maxScroll))
    const cardIndex = Math.min(totalCards - 1, Math.round(progress * (totalCards - 1)))
    setActiveCardIndex(cardIndex)
  }, [totalCards, activeCardIndex])

  React.useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    handleScroll()
    container.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [handleScroll, totalCards])

  const goToCard = (cardIndex: number) => {
    const targetIndex = Math.min(Math.max(0, cardIndex), Math.max(0, totalCards - 1))
    const targetEl = cardRefs.current[targetIndex]
    if (targetEl) {
      if (typeof targetEl.scrollIntoView === 'function') {
        targetEl.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
      } else if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = targetEl.offsetLeft
      }
    }
    setActiveCardIndex(targetIndex)
    setCanScrollPrev(targetIndex > 0)
    setCanScrollNext(targetIndex < totalCards - 1)
  }

  const goToDesktopPage = (pageIndex: number) => {
    goToCard(pageIndex * CARDS_PER_PAGE_DESKTOP)
  }

  const prev = () => {
    if (activeDesktopPage > 0) {
      goToDesktopPage(activeDesktopPage - 1)
    }
  }

  const next = () => {
    if (activeDesktopPage < desktopPages - 1) {
      goToDesktopPage(activeDesktopPage + 1)
    }
  }

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`py-12 lg:py-20 ${className}`}
    >
      <div className="mx-auto max-w-[var(--header-max-width,1024px)] px-4 lg:px-6">
        {/* Rail Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id={headingId}
            className="text-h4 font-bold tracking-tight text-foreground text-start"
          >
            {t(`rails.${titleKey}`, { ns: 'home', defaultValue: titleKey })}
          </h2>
          <Link
            to={viewAllHref.replace(':lang', currentLang)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group inline-flex items-center gap-1"
          >
            <span>{t('rails.viewAll', { ns: 'home', defaultValue: 'View all' })}</span>
            <ChevronRight
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
            />
          </Link>
        </div>

        {/* Rail Content: Loading / Error / Empty / Loaded */}
        {isLoading ? (
          <div aria-busy="true">
            <ProductRailSkeleton />
          </div>
        ) : isError ? (
          <div
            data-testid={`rail-error-${id}`}
            className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3"
          >
            <p className="text-sm text-destructive">
              {t('rails.error', {
                ns: 'home',
                defaultValue: 'Unable to load products. Please try again.',
              })}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="cursor-pointer"
            >
              {t('rails.retry', { ns: 'home', defaultValue: 'Try again' })}
            </Button>
          </div>
        ) : !products || products.length === 0 ? (
          <div
            data-testid={`rail-empty-${id}`}
            className="rounded-2xl border border-border/40 bg-card p-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              {t('rails.empty', {
                ns: 'home',
                defaultValue: 'No products currently available in this section.',
              })}
            </p>
          </div>
        ) : (
          <div className="relative group/rail">
            {/* Desktop Side Arrow: Previous */}
            {desktopPages > 1 && (
              <Button
                variant="outline"
                size="icon"
                aria-label={t('rails.prev', { ns: 'home', defaultValue: 'Previous products' })}
                onClick={prev}
                disabled={!canScrollPrev}
                className={cn(
                  'absolute start-1 lg:start-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex',
                  'size-11 rounded-full border border-border/80 bg-background/95 text-foreground shadow-md backdrop-blur-xs cursor-pointer',
                  'hover:bg-accent hover:border-foreground/30 hover:scale-105 active:scale-95 transition-all',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  !canScrollPrev && 'opacity-0 pointer-events-none'
                )}
              >
                <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
              </Button>
            )}

            {/* Scrollable Track: inside container padding for 16px start margin */}
            <div
              ref={scrollContainerRef}
              data-testid={`rail-content-${id}`}
              className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 text-start scroll-smooth"
            >
              {products.map((product, idx) => (
                <div
                  key={product.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el
                  }}
                  className="w-[82%] sm:w-[240px] lg:w-[calc((100%-60px)/4)] shrink-0 snap-start flex"
                >
                  <ProductCard product={product} className="h-full w-full" />
                </div>
              ))}
            </div>

            {/* Desktop Side Arrow: Next */}
            {desktopPages > 1 && (
              <Button
                variant="outline"
                size="icon"
                aria-label={t('rails.next', { ns: 'home', defaultValue: 'Next products' })}
                onClick={next}
                disabled={!canScrollNext}
                className={cn(
                  'absolute end-1 lg:end-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex',
                  'size-11 rounded-full border border-border/80 bg-background/95 text-foreground shadow-md backdrop-blur-xs cursor-pointer',
                  'hover:bg-accent hover:border-foreground/30 hover:scale-105 active:scale-95 transition-all',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  !canScrollNext && 'opacity-0 pointer-events-none'
                )}
              >
                <ChevronRight className="size-5 rtl:rotate-180" aria-hidden="true" />
              </Button>
            )}

            {/* Mobile Pagination Dots: 1 per card shown */}
            {totalCards > 1 && (
              <nav
                data-testid={`rail-dots-mobile-${id}`}
                aria-label={t(`rails.${titleKey}`, { ns: 'home', defaultValue: titleKey })}
                className="flex items-center justify-center gap-1.5 mt-5 lg:hidden select-none"
              >
                {Array.from({ length: totalCards }, (_, i) => {
                  const isActive = activeCardIndex === i
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToCard(i)}
                      aria-label={t('rails.goToPage', {
                        ns: 'home',
                        page: i + 1,
                        total: totalCards,
                        defaultValue: `Go to item ${i + 1} of ${totalCards}`,
                      })}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'rounded-full transition-all duration-300 outline-none cursor-pointer',
                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isActive
                          ? 'h-1.5 w-5 bg-primary shadow-xs'
                          : 'size-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                      )}
                    />
                  )
                })}
              </nav>
            )}

            {/* Desktop Pagination Dots: 1 per 4-card page */}
            {desktopPages > 1 && (
              <nav
                data-testid={`rail-dots-desktop-${id}`}
                aria-label={t(`rails.${titleKey}`, { ns: 'home', defaultValue: titleKey })}
                className="hidden lg:flex items-center justify-center gap-2 mt-6 select-none"
              >
                {Array.from({ length: desktopPages }, (_, i) => {
                  const isActive = activeDesktopPage === i
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToDesktopPage(i)}
                      aria-label={t('rails.goToPage', {
                        ns: 'home',
                        page: i + 1,
                        total: desktopPages,
                        defaultValue: `Go to page ${i + 1} of ${desktopPages}`,
                      })}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'rounded-full transition-all duration-300 outline-none cursor-pointer',
                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isActive
                          ? 'h-2 w-6 bg-primary shadow-xs'
                          : 'size-2 bg-muted-foreground/30 hover:bg-muted-foreground/60 hover:scale-125'
                      )}
                    />
                  )
                })}
              </nav>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
