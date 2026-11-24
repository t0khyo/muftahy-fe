import * as React from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  FileSpreadsheet,
  FolderTree,
  Grid2x2,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { CategoryResponse } from '@workspace/domain/schemas/product'
import type { BrowseSectionConfig } from '../home.config'
import { usePublicCategories } from '../../products/hooks/use-products'

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
  iconBg: string
  iconColor: string
  codeBg: string
  codeLabel: string
  glowClass: string
  specsEn: string[]
  specsAr: string[]
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'operating-systems': {
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    iconColor: 'text-blue-600 dark:text-blue-400',
    codeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    codeLabel: 'OS • System',
    glowClass: 'from-blue-500/5 via-transparent to-transparent',
    specsEn: ['Windows 11 & 10', 'Lifetime License', 'Retail & OEM'],
    specsAr: ['ويندوز 11 و10', 'تفعيل مدى الحياة', 'نسخ Retail وOEM'],
  },
  'security-antivirus': {
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    codeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    codeLabel: 'SEC • Defense',
    glowClass: 'from-emerald-500/5 via-transparent to-transparent',
    specsEn: ['Real-Time Shield', 'Multi-Device', 'VPN Included'],
    specsAr: ['حماية فورية', 'أجهزة متعددة', 'VPN مدمج'],
  },
  'office-suites': {
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    iconColor: 'text-amber-600 dark:text-amber-400',
    codeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    codeLabel: 'OFF • Productivity',
    glowClass: 'from-amber-500/5 via-transparent to-transparent',
    specsEn: ['Word, Excel & PPT', 'Lifetime Activation', '1 PC / Mac'],
    specsAr: ['وورد، إكسل، باوربوينت', 'تفعيل دائم', 'جهاز واحد'],
  },
}

const DEFAULT_THEME: CategoryTheme = {
  iconBg: 'bg-primary/10',
  iconColor: 'text-primary',
  codeBg: 'bg-secondary text-secondary-foreground',
  codeLabel: 'CAT • Category',
  glowClass: 'from-primary/5 via-transparent to-transparent',
  specsEn: [],
  specsAr: [],
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

function resolveCategoryIcon(code?: string, slug?: string): React.ComponentType<{ className?: string }> {
  const normalizedCode = code?.toUpperCase()
  const normalizedSlug = slug?.toLowerCase()

  if (
    normalizedCode === 'OS' ||
    normalizedSlug === 'operating-systems' ||
    normalizedSlug?.includes('windows') ||
    normalizedSlug?.includes('operating')
  ) {
    return Grid2x2
  }
  if (
    normalizedCode === 'SEC' ||
    normalizedSlug === 'security-antivirus' ||
    normalizedSlug?.includes('security') ||
    normalizedSlug?.includes('antivirus')
  ) {
    return ShieldCheck
  }
  if (
    normalizedCode === 'OFF' ||
    normalizedSlug === 'office-suites' ||
    normalizedSlug?.includes('office')
  ) {
    return FileSpreadsheet
  }
  return FolderTree
}

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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 mb-3">
              {t('browse.sectionBadge', { defaultValue: isRtl ? 'الكتالوج' : 'Catalog' })}
            </span>
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

        {/* 3-Column Responsive Category Cards Grid with Taste Craftsmanship */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((cat: CategoryResponse | CanonicalCategory) => {
            const Icon = resolveCategoryIcon(cat.code, cat.slug)
            const theme = CATEGORY_THEMES[cat.slug] || DEFAULT_THEME

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

            // Dynamic localized specs (taste fragment)
            const specs = isRtl ? (theme.specsAr || theme.specsEn) : theme.specsEn

            const count = typeof cat.product_count === 'number' ? cat.product_count : 0

            return (
              <Link
                key={cat.id || cat.slug}
                to={`/${currentLang}/categories/${cat.slug}`}
                className={cn(
                  'group relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 lg:p-7 text-start',
                  'border border-border/50 bg-card/95 hover:bg-card',
                  'dark:border-white/10 dark:hover:border-white/20 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
                  'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-primary/5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                )}
              >
                {/* Subtle radial ambient glow on hover */}
                <div
                  className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                    theme.glowClass,
                  )}
                  aria-hidden="true"
                />

                <div className="relative space-y-4">
                  {/* Card Header Row: Category Badge + Code Pill + Step Chevron */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'size-12 rounded-xl flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-105',
                          theme.iconBg,
                          theme.iconColor,
                        )}
                      >
                        <Icon className="size-6" />
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase',
                          theme.codeBg,
                        )}
                      >
                        {theme.codeLabel}
                      </span>
                    </div>

                    <div className="size-8 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 shrink-0">
                      <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1.5 pt-1">
                    <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {description}
                    </p>
                  </div>

                  {/* Tactile Micro-Spec Chips (Taste Fragment) */}
                  {specs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {specs.map((spec, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-md border border-border/40 bg-secondary/50 px-2 py-0.5 text-xs font-medium text-foreground/80 transition-colors group-hover:border-border/70 group-hover:bg-secondary/80"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Status Bar: Count / Coming Soon & Quiet Action Hint */}
                <div className="relative mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-xs">
                  {count > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/90 px-2.5 py-0.5 font-medium text-secondary-foreground">
                      <span className="size-1.5 rounded-full bg-success animate-pulse" aria-hidden="true" />
                      {t('browse.itemCount', {
                        ns: 'home',
                        count,
                        defaultValue: `${count} items`,
                      })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-2.5 py-0.5 font-medium text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-muted-foreground/50" aria-hidden="true" />
                      {t('browse.comingSoon', {
                        ns: 'home',
                        defaultValue: isRtl ? 'قريباً' : 'Coming soon',
                      })}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                    <span>{t('browse.exploreCategory', { ns: 'home', defaultValue: isRtl ? 'استكشف القسم' : 'Explore category' })}</span>
                    <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
