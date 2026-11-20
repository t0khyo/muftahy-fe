import { Link, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  FileSpreadsheet,
  Grid2x2,
  LayoutGrid,
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
    id: 'windows',
    key: 'windows',
    defaultLabel: 'Windows',
    icon: Grid2x2,
  },
  {
    id: 'office',
    key: 'office',
    defaultLabel: 'Office',
    icon: FileSpreadsheet,
  },
]

export function CategoryRow({ activeCategory, className }: CategoryRowProps) {
  const { t, i18n } = useTranslation(['products', 'common'])
  const currentLang = i18n.language === 'ar' ? 'ar' : 'en'
  const location = useLocation()

  const buildCategoryUrl = (catId: ProductCategory | 'all'): string => {
    const params = new URLSearchParams(location.search)
    if (catId === 'all') {
      params.delete('category')
    } else {
      params.set('category', catId)
    }
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
      <div className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none py-1">
        {CATEGORY_ITEMS.map((item) => {
          const isActive = currentSelection === item.id
          const Icon = item.icon
          const label =
            item.id === 'all'
              ? t('all', { ns: 'common', defaultValue: item.defaultLabel })
              : t(`categories.${item.id}`, { ns: 'products', defaultValue: item.defaultLabel })

          return (
            <Link
              key={item.id}
              to={buildCategoryUrl(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'inline-flex h-11 lg:h-10 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-medium transition-all select-none outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary border border-border/40',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
