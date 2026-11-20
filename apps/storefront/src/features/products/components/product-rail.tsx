import * as React from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@workspace/ui/components/carousel'
import { cn } from '@workspace/ui/lib/utils'
import type { ProductCategory, ProductResponse } from '@workspace/domain/schemas/product'
import { useProducts } from '../hooks/use-products'
import { ProductCard } from './product-card'
import { ProductRailSkeleton } from './product-rail-skeleton'

export interface ProductRailProps {
  id: string
  titleKey: string
  viewAllHref: string
  category?: ProductCategory
  collection?: string
  products?: ProductResponse[]
  className?: string
}

export function ProductRail({
  id,
  titleKey,
  viewAllHref,
  category,
  products: directProducts,
  className = '',
}: ProductRailProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const isRtl = currentLang === 'ar'
  const { t } = useTranslation(['home', 'common'])

  const {
    data: fetchedProducts,
    isLoading,
    isError,
    refetch,
  } = useProducts(directProducts ? undefined : { category })

  const products = directProducts ?? fetchedProducts

  const headingId = `${id}-heading`

  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCount(api.scrollSnapList().length)
      setCurrent(api.selectedScrollSnap())
    }

    queueMicrotask(onSelect)

    api.on('select', onSelect)
    api.on('reInit', onSelect)

    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  const totalCards = products?.length ?? 0
  const displayDotsCount = count > 0 ? count : totalCards

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index)
    }
    setCurrent(index)
  }

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`py-12 lg:py-20 ${className}`}
    >
      <div className="site-container">
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
        {isLoading && !directProducts ? (
          <div aria-busy="true">
            <ProductRailSkeleton />
          </div>
        ) : isError && !directProducts ? (
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
          <Carousel
            dir={isRtl ? 'rtl' : 'ltr'}
            opts={{
              align: 'start',
              loop: true,
              direction: isRtl ? 'rtl' : 'ltr',
            }}
            setApi={setApi}
            className="w-full relative"
          >
            {/* Desktop Flex Row with Flanking Outside Buttons */}
            <div className="flex items-center gap-3 lg:gap-4">
              <CarouselPrevious
                variant="outline"
                size="icon"
                aria-label={t('rails.prev', { ns: 'home', defaultValue: 'Previous products' })}
                className="static hidden lg:flex shrink-0 size-10 rounded-full border border-border/80 bg-background text-foreground shadow-xs hover:bg-accent hover:border-foreground/30 hover:scale-105 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />

              {/* Embla Viewport Track */}
              <div
                data-testid={`rail-content-${id}`}
                className="flex-1 min-w-0"
              >
                <CarouselContent className="-ms-4">
                  {products.map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="ps-4 basis-[82%] sm:basis-[240px] lg:basis-1/4"
                    >
                      <ProductCard product={product} className="h-full w-full" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>

              <CarouselNext
                variant="outline"
                size="icon"
                aria-label={t('rails.next', { ns: 'home', defaultValue: 'Next products' })}
                className="static hidden lg:flex shrink-0 size-10 rounded-full border border-border/80 bg-background text-foreground shadow-xs hover:bg-accent hover:border-foreground/30 hover:scale-105 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {/* Pagination Dots (Map) */}
            {displayDotsCount > 1 && (
              <nav
                data-testid={`rail-dots-${id}`}
                aria-label={t(`rails.${titleKey}`, { ns: 'home', defaultValue: titleKey })}
                className="flex items-center justify-center gap-1.5 mt-5 lg:mt-6 select-none"
              >
                {Array.from({ length: displayDotsCount }, (_, i) => {
                  const isActive = current === i
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleDotClick(i)}
                      aria-label={t('rails.goToPage', {
                        ns: 'home',
                        page: i + 1,
                        total: displayDotsCount,
                        defaultValue: `Go to item ${i + 1} of ${displayDotsCount}`,
                      })}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'rounded-full transition-all duration-300 outline-none cursor-pointer',
                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isActive
                          ? 'h-1.5 w-5 lg:h-2 lg:w-6 bg-primary shadow-xs'
                          : 'size-1.5 lg:size-2 bg-muted-foreground/30 hover:bg-muted-foreground/60',
                      )}
                    />
                  )
                })}
              </nav>
            )}
          </Carousel>
        )}
      </div>
    </section>
  )
}
