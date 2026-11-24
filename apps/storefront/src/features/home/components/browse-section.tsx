import * as React from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { CategoryResponse } from '@workspace/domain/schemas/product'
import type { BrowseSectionConfig } from '../home.config'
import { usePublicCategories } from '../../products/hooks/use-products'
import { resolveCategoryIcon } from '../../products/utils/category-icon'
import {
  OsWindowPattern,
  SecurityRadarPattern,
  OfficeFolioPattern,
  PrismRibbonPattern,
} from './browse-card-patterns'

export interface BrowseSectionProps {
  config: BrowseSectionConfig
  className?: string
}

interface CanonicalCategory {
  id: string
  name: string
  code: string
  slug: string
  description: string
  display_order: number
  is_active: boolean
  product_count: number
}

interface CategoryTheme {
  cardClass: string
  pattern: React.ComponentType<{ className?: string }>
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'operating-systems': {
    cardClass: 'apple-card-os',
    pattern: OsWindowPattern,
  },
  'security-antivirus': {
    cardClass: 'apple-card-security',
    pattern: SecurityRadarPattern,
  },
  'office-suites': {
    cardClass: 'apple-card-office',
    pattern: OfficeFolioPattern,
  },
}

const DEFAULT_THEME: CategoryTheme = {
  cardClass: 'apple-card-fallback',
  pattern: PrismRibbonPattern,
}

const DEFAULT_CATEGORIES: CanonicalCategory[] = [
  {
    id: '816a04e2-5bc8-402d-9425-8a2e915a3b57',
    name: 'Operating Systems',
    code: 'OS',
    slug: 'operating-systems',
    description: 'Microsoft Windows operating system licenses',
    display_order: 1,
    is_active: true,
    product_count: 3,
  },
  {
    id: 'df83a49f-739b-45a5-8f3c-67b00b3f4295',
    name: 'Security & Antivirus',
    code: 'SEC',
    slug: 'security-antivirus',
    description: 'Antivirus, internet security, and VPN software licenses',
    display_order: 2,
    is_active: true,
    product_count: 0,
  },
  {
    id: 'a75cc5a9-9f2b-4815-ac49-ec3848cec724',
    name: 'Office Suites',
    code: 'OFF',
    slug: 'office-suites',
    description: 'Productivity and office suite software licenses',
    display_order: 3,
    is_active: true,
    product_count: 2,
  },
]

export function BrowseSection({ config, className = '' }: BrowseSectionProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const isRtl = currentLang === 'ar'
  const { t } = useTranslation(['home', 'products', 'common'])

  const { data: fetchedCategories = [] } = usePublicCategories()

  // Use configured categories, or fetched categories, or fall back to defaults
  const categories = React.useMemo(() => {
    if (config.categories && config.categories.length > 0) {
      return config.categories.map((c, index) => ({
        id: c.id,
        name: c.labelKey || c.id,
        code: c.code || '',
        slug: c.slug || c.id,
        description: c.descKey || '',
        display_order: index + 1,
        is_active: true,
        product_count: c.productCount ?? 0,
      }))
    }

    const source = fetchedCategories.length > 0 ? fetchedCategories : DEFAULT_CATEGORIES
    return [...source]
      .filter((cat) => cat.is_active !== false)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  }, [config.categories, fetchedCategories])

  const headingId = `${config.id}-heading`

  return (
    <section
      id={config.id}
      aria-labelledby={headingId}
      className={`py-12 lg:py-20 ${className}`}
    >
      <div className="site-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 lg:mb-12 gap-4">
          <div className="text-start">
            <h2
              id={headingId}
              className="text-h3 font-bold tracking-tight text-foreground"
            >
              {t(config.titleKey ?? 'browse.title', {
                defaultValue: isRtl ? 'تصفح حسب الفئة' : 'Browse by Category',
              })}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              {t(config.subtitleKey ?? 'browse.subtitle', {
                defaultValue: isRtl
                  ? 'اختر من أنظمة التشغيل وحزم البرامج المكتبية وحلول الأمان الأصلية مع تسليم فوري'
                  : 'Choose genuine operating systems, productivity suites, and security software with instant digital delivery',
              })}
            </p>
          </div>

          <Link
            to={`/${currentLang}/products`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group inline-flex items-center gap-1 self-start md:self-auto"
          >
            <span>{t('browse.viewAll', { defaultValue: 'View all products' })}</span>
            <ChevronRight
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
            />
          </Link>
        </div>

        {/* 3-Column Responsive Category Cards Grid with Apple HIG Colorful Mesh Gradients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {categories.map((cat: CategoryResponse | CanonicalCategory) => {
            const Icon = resolveCategoryIcon(cat.code, cat.slug)
            const theme = CATEGORY_THEMES[cat.slug] || DEFAULT_THEME
            const Pattern = theme.pattern

            // Dynamic localized category title
            const title = t(`categories.${cat.slug}`, {
              ns: 'products',
              defaultValue: t(`browse.categories.${cat.slug}`, {
                ns: 'home',
                defaultValue: cat.name,
              }),
            })

            // Dynamic localized category description
            const description = t(`browse.categories.${cat.slug}Desc`, {
              ns: 'home',
              defaultValue: cat.description || '',
            })

            const count = typeof cat.product_count === 'number' ? cat.product_count : 0

            return (
              <Link
                key={cat.id || cat.slug}
                to={`/${currentLang}/categories/${cat.slug}`}
                className={cn(
                  'group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-5.5 lg:p-6 text-start',
                  'border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]',
                  'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  theme.cardClass,
                )}
              >
                {/* Layered Geometric Vector Pattern Artwork */}
                <div
                  className="pointer-events-none absolute -bottom-3 -end-3 size-36 sm:size-40 text-white opacity-25 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:opacity-35 rtl:-scale-x-100"
                  aria-hidden="true"
                >
                  <Pattern className="size-full" />
                </div>

                <div className="relative space-y-3.5">
                  {/* Tier 1: Visual Identity (Icon) + Scannable Availability Badge */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="size-10 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/25 flex items-center justify-center shadow-xs transition-transform duration-300 ease-out group-hover:scale-105">
                      <Icon className="size-5" />
                    </div>

                    {count > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-medium text-white border border-white/15">
                        <span className="size-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
                        {t('browse.itemCount', {
                          ns: 'home',
                          count,
                          defaultValue: `${count} items`,
                        })}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-medium text-white/90 border border-white/10">
                        <span className="size-1.5 rounded-full bg-white/60" aria-hidden="true" />
                        {t('browse.comingSoon', {
                          ns: 'home',
                          defaultValue: isRtl ? 'قريباً' : 'Coming soon',
                        })}
                      </span>
                    )}
                  </div>

                  {/* Tier 2: Primary Content (Title + Concise Description) */}
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                      {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/85 leading-relaxed line-clamp-2">
                      {description}
                    </p>
                  </div>
                </div>

                {/* Tier 3: Single Clear Action Cue */}
                <div className="relative mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/90 group-hover:text-white transition-colors duration-200">
                  <span className="font-medium">
                    {t('browse.exploreCategory', { ns: 'home', defaultValue: isRtl ? 'استكشف القسم' : 'Explore category' })}
                  </span>
                  <div className="size-7 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-200 shrink-0">
                    <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
