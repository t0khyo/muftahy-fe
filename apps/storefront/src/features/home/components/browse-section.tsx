import * as React from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Gamepad2,
  AppWindow,
  Repeat,
  Gift,
  ChevronRight,
  LayoutGrid,
  Monitor,
  Laptop,
  Gamepad,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { BrowseSectionConfig } from '../home.config'
import { useProducts } from '../../products/hooks/use-products'

export interface BrowseSectionProps {
  config: BrowseSectionConfig
  className?: string
}

interface CategoryCardItem {
  id: 'games' | 'software' | 'subscriptions' | 'gift-cards'
  nameKey: string
  descKey: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  variant: 'games' | 'software' | 'subscriptions' | 'giftCards'
}

const CATEGORIES: CategoryCardItem[] = [
  {
    id: 'software',
    nameKey: 'categories.software',
    descKey: 'categories.softwareDesc',
    href: '/:lang/products?category=software',
    icon: AppWindow,
    variant: 'software',
  },
  {
    id: 'subscriptions',
    nameKey: 'categories.subscriptions',
    descKey: 'categories.subscriptionsDesc',
    href: '/:lang/products?category=subscriptions',
    icon: Repeat,
    variant: 'subscriptions',
  },
  {
    id: 'gift-cards',
    nameKey: 'categories.giftCards',
    descKey: 'categories.giftCardsDesc',
    href: '/:lang/products?category=gift-cards',
    icon: Gift,
    variant: 'giftCards',
  },
  {
    id: 'games',
    nameKey: 'categories.games',
    descKey: 'categories.gamesDesc',
    href: '/:lang/products?category=games',
    icon: Gamepad2,
    variant: 'games',
  },
]

interface PlatformItem {
  id: string
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
}

const KNOWN_PLATFORMS: PlatformItem[] = [
  { id: 'steam', labelKey: 'platformSteam', icon: Monitor },
  { id: 'microsoft', labelKey: 'platformMicrosoft', icon: Laptop },
  { id: 'xbox', labelKey: 'platformXbox', icon: Gamepad2 },
  { id: 'playstation', labelKey: 'platformPlaystation', icon: Gamepad },
]

export function BrowseSection({ config, className = '' }: BrowseSectionProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const isRtl = currentLang === 'ar'
  const { t } = useTranslation(['home', 'products', 'common'])

  // Fetch all products to compute active platforms
  const { data: result } = useProducts()
  const products = result?.items

  const activePlatforms = React.useMemo(() => {
    if (!products) return []
    const available = new Set(products.map((p) => p.platform?.toLowerCase()))
    return KNOWN_PLATFORMS.filter((p) => available.has(p.id))
  }, [products])

  const headingId = `${config.id}-heading`

  return (
    <section
      id={config.id}
      aria-labelledby={headingId}
      className={cn('py-12 lg:py-20 text-start', className)}
    >
      <div className="mx-auto max-w-[var(--header-max-width,1024px)] px-4 lg:px-6">
        {/* Unified Block Header */}
        <div className="mb-8 space-y-1.5">
          <h2
            id={headingId}
            className={cn(
              'text-2xl sm:text-3xl font-bold text-foreground',
              isRtl ? 'tracking-normal' : 'tracking-tight'
            )}
          >
            {t(config.titleKey || 'browse.title', {
              ns: 'home',
              defaultValue: isRtl ? 'تصفح المنتجات' : 'Browse Catalog',
            })}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl font-normal">
            {t(config.subtitleKey || 'browse.subtitle', {
              ns: 'home',
              defaultValue: isRtl
                ? 'استكشف المفاتيح والتراخيص والاشتراكات عبر منصاتك المفضلة.'
                : 'Explore keys, licenses, and subscriptions across your favorite platforms.',
            })}
          </p>
        </div>

        {/* 4-Tile Category Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isLarge = cat.id === 'software' || cat.id === 'subscriptions'
            const resolvedHref = cat.href.replace(':lang', currentLang)

            // Unified Apple-store editorial styling across all tiles
            const tileStyle =
              'bg-card border border-border/60 text-card-foreground hover:bg-secondary/35 hover:border-foreground/20'

            const iconContainerStyle =
              'bg-secondary/80 text-foreground group-hover:bg-primary/10 group-hover:text-primary'

            return (
              <Link
                key={cat.id}
                to={resolvedHref}
                className={cn(
                  'group relative flex flex-col justify-between overflow-hidden rounded-3xl p-4 lg:p-6 shadow-none transition-all duration-200 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'min-h-[140px]',
                  isLarge
                    ? 'lg:col-span-2 lg:min-h-[280px]'
                    : 'lg:col-span-2 lg:min-h-[132px] lg:flex-row lg:items-center lg:justify-between',
                  tileStyle
                )}
              >
                {/* Top / Left Header */}
                <div
                  className={cn(
                    'flex items-center justify-between w-full',
                    !isLarge && 'lg:w-auto lg:gap-4'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-xl lg:rounded-2xl transition-transform duration-200 lg:group-hover:scale-105 motion-reduce:transform-none',
                      'size-10 lg:size-13',
                      iconContainerStyle
                    )}
                  >
                    <Icon className="size-5 lg:size-6 shrink-0" />
                  </div>

                  {/* Desktop Right Chevron for small tiles */}
                  {!isLarge && (
                    <div className="lg:hidden">
                      <ChevronRight
                        aria-hidden="true"
                        className="size-4.5 text-muted-foreground transition-transform lg:group-hover:translate-x-1 rtl:rotate-180 rtl:lg:group-hover:-translate-x-1 motion-reduce:transform-none"
                      />
                    </div>
                  )}

                  {/* Large tile top chevron */}
                  {isLarge && (
                    <ChevronRight
                      aria-hidden="true"
                      className="size-5 text-muted-foreground transition-transform lg:group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 motion-reduce:transform-none"
                    />
                  )}
                </div>

                {/* Content info: Name & Descriptor */}
                <div
                  className={cn(
                    'mt-3 lg:mt-0 space-y-1',
                    !isLarge && 'lg:flex-1 lg:ps-4'
                  )}
                >
                  <h3 className="text-base lg:text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {t(`browse.${cat.nameKey}`, {
                      ns: 'home',
                      defaultValue: cat.id,
                    })}
                  </h3>
                  <p className="text-xs lg:text-sm text-muted-foreground font-normal line-clamp-1">
                    {t(`browse.${cat.descKey}`, {
                      ns: 'home',
                      defaultValue: '',
                    })}
                  </p>
                </div>

                {/* Small tile desktop chevron */}
                {!isLarge && (
                  <div className="hidden lg:block shrink-0 ms-4">
                    <ChevronRight
                      aria-hidden="true"
                      className="size-5 text-muted-foreground transition-transform lg:group-hover:translate-x-1 rtl:rotate-180 rtl:lg:group-hover:-translate-x-1 motion-reduce:transform-none"
                    />
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Platform Pill Row (~24px below category tiles) */}
        <div className="mt-6 lg:mt-8">
          <div className="flex items-center gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible lg:flex-wrap lg:justify-center">
            {/* Optional "All" Pill First */}
            <Link
              to={`/${currentLang}/products`}
              className={cn(
                'inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-medium',
                'bg-card border border-border/40 text-foreground transition-colors',
                'hover:bg-secondary/60 hover:border-border',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            >
              <LayoutGrid className="size-5 text-muted-foreground" aria-hidden="true" />
              <span>
                {t('browse.allPlatforms', {
                  ns: 'home',
                  defaultValue: isRtl ? 'جميع المنصات' : 'All Platforms',
                })}
              </span>
            </Link>

            {/* Dynamic Active Platforms */}
            {activePlatforms.map((platform) => {
              const Icon = platform.icon
              const label = t(platform.labelKey, {
                ns: 'products',
                defaultValue: platform.id,
              })

              return (
                <Link
                  key={platform.id}
                  to={`/${currentLang}/products?platform=${platform.id}`}
                  className={cn(
                    'inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-medium',
                    'bg-card border border-border/40 text-foreground transition-colors',
                    'hover:bg-secondary/60 hover:border-border',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                >
                  <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

