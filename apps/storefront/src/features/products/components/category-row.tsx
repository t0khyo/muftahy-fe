import { Link, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  AppWindow,
  Gamepad2,
  Gift,
  LayoutGrid,
  Sparkles,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { ProductCategory } from '@workspace/domain/schemas/product'

export interface CategoryRowProps {
  activeCategory?: ProductCategory
  className?: string
}

interface CategoryItemDef {
  id: ProductCategory | 'all'
  key: string
  defaultLabel: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
}

const CATEGORY_ITEMS: CategoryItemDef[] = [
  {
    id: 'all',
    key: 'all',
    defaultLabel: 'All',
    icon: LayoutGrid,
  },
  {
    id: 'software',
    key: 'software',
    defaultLabel: 'Software',
    icon: AppWindow,
  },
  {
    id: 'subscriptions',
    key: 'subscriptions',
    defaultLabel: 'Subscriptions',
    icon: Sparkles,
  },
  {
    id: 'gift-cards',
    key: 'giftCards',
    defaultLabel: 'Gift cards',
    icon: Gift,
  },
  {
    id: 'games',
    key: 'games',
    defaultLabel: 'Games',
    icon: Gamepad2,
  },
]

export function CategoryRow({ activeCategory, className }: CategoryRowProps) {
  const { t, i18n } = useTranslation(['categories', 'products', 'common'])
  const currentLang = i18n.language === 'ar' ? 'ar' : 'en'
  const location = useLocation()

  // Helper to construct URL preserving existing search params while updating category
  const buildCategoryUrl = (catId: ProductCategory | 'all'): string => {
    const params = new URLSearchParams(location.search)
    if (catId === 'all') {
      params.delete('category')
    } else {
      params.set('category', catId)
    }
    // Reset page to 1 when category changes
    params.delete('page')

    const qs = params.toString()
    return `/${currentLang}/products${qs ? `?${qs}` : ''}`
  }

  const currentSelection = activeCategory ?? 'all'

  return (
    <nav
      aria-label={t('category', { ns: 'products', defaultValue: 'Category' })}
      className={cn('mb-4 lg:mb-6', className)}
    >
      {/* ── Mobile View: 44px snap-scroll pills with 20px icons & 14px labels ── */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none py-1">
        {CATEGORY_ITEMS.map((item) => {
          const isActive = currentSelection === item.id
          const Icon = item.icon
          const label = t(item.key as never, { ns: 'categories', defaultValue: item.defaultLabel })

          return (
            <Link
              key={item.id}
              to={buildCategoryUrl(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-medium transition-all select-none outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-secondary/70 text-foreground hover:bg-secondary border border-border/40',
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden={true} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>

      {/* ── Desktop View: 5 tiles in 1 row (96px high, 40px icon container, 2-line text clearance, 12px gap) ── */}
      <div className="hidden lg:grid grid-cols-5 gap-3">
        {CATEGORY_ITEMS.map((item) => {
          const isActive = currentSelection === item.id
          const Icon = item.icon
          const label = t(item.key as never, { ns: 'categories', defaultValue: item.defaultLabel })

          return (
            <Link
              key={item.id}
              to={buildCategoryUrl(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl px-2 py-2.5 transition-all select-none outline-none border text-center',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'bg-card border-foreground/30 shadow-xs text-foreground font-semibold ring-1 ring-foreground/20'
                  : 'bg-secondary/35 border-transparent text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
              )}
            >
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 motion-reduce:transform-none',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-background/80 text-foreground/80 shadow-2xs',
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden={true} />
              </div>
              <span className="text-base leading-tight line-clamp-2 max-w-full px-1">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
