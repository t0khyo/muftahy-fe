import { Link, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, FolderTree } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { CategoryResponse } from '@workspace/domain/schemas/product'
import { usePublicCategories } from '../hooks/use-products'

export interface CategoryRowProps {
  activeCategory?: string
  categories?: CategoryResponse[]
  className?: string
}

export function CategoryRow({ activeCategory, categories: propCategories, className }: CategoryRowProps) {
  const { t, i18n } = useTranslation(['products', 'common'])
  const currentLang = i18n.language === 'ar' ? 'ar' : 'en'
  const location = useLocation()

  const { data: fetchedCategories = [] } = usePublicCategories()
  const categories = propCategories ?? fetchedCategories
  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order)

  const buildCategoryUrl = (slug?: string): string => {
    const params = new URLSearchParams(location.search)
    if (!slug || slug === 'all') {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    params.delete('page')

    const qs = params.toString()
    return `/${currentLang}/products${qs ? `?${qs}` : ''}`
  }

  const isAllActive = !activeCategory || activeCategory === 'all'

  return (
    <nav
      aria-label={t('category', { ns: 'products', defaultValue: 'Category' })}
      className={cn('mb-4 lg:mb-6', className)}
    >
      <div className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none py-1">
        {/* All Pill */}
        <Link
          to={buildCategoryUrl('all')}
          aria-current={isAllActive ? 'page' : undefined}
          className={cn(
            'inline-flex h-11 lg:h-10 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-medium transition-all select-none outline-none',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isAllActive
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary border border-border/40',
          )}
        >
          <LayoutGrid className="size-4 shrink-0" aria-hidden="true" />
          <span>{t('all', { ns: 'common', defaultValue: 'All' })}</span>
        </Link>

        {/* Dynamic Category Pills */}
        {sortedCategories.map((cat) => {
          const isActive = activeCategory === cat.slug

          return (
            <Link
              key={cat.id}
              to={buildCategoryUrl(cat.slug)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'inline-flex h-11 lg:h-10 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-medium transition-all select-none outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary border border-border/40',
              )}
            >
              <FolderTree className="size-4 shrink-0" aria-hidden="true" />
              <span>{cat.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
