import { useTranslation } from 'react-i18next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@workspace/ui/lib/utils'
import type { CategoryResponse } from '@workspace/domain/schemas/product'
import type { ProductFiltersState } from '../hooks/use-product-filters'
import type { FilterCounts } from '../hooks/use-filter-counts'

export interface FilterSidebarProps {
  categories?: CategoryResponse[]
  state: ProductFiltersState
  counts?: FilterCounts
  activeFiltersCount: number
  onSetCategory: (cat?: string) => void
  onSetVariant: (variant?: 'retail' | 'oem') => void
  onClearAll: () => void
  className?: string
}

export function FilterSidebar({
  categories,
  state,
  counts,
  activeFiltersCount,
  onSetCategory,
  onSetVariant,
  onClearAll,
  className,
}: FilterSidebarProps) {
  const { t } = useTranslation(['products', 'common'])

  return (
    <aside
      aria-label={t('listing.filters', { defaultValue: 'Filters' })}
      className={cn('flex flex-col gap-6 text-start', className)}
    >
      {/* Header with Title and Clear All */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">
            {t('listing.filters', { defaultValue: 'Filters' })}
          </h2>
          {activeFiltersCount > 0 && (
            <Badge className="flex size-5 items-center justify-center rounded-full p-0 text-[11px] font-medium">
              {activeFiltersCount}
            </Badge>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {t('listing.clearAll', { defaultValue: 'Clear all' })}
          </Button>
        )}
      </div>

      <Accordion
        defaultValue={['category', 'variant']}
        className="w-full space-y-4"
      >
        {/* Category Accordion */}
        <AccordionItem value="category" className="border-border/40">
          <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-2">
            {t('category', { defaultValue: 'Category' })}
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-1 space-y-1">
            <button
              type="button"
              onClick={() => onSetCategory(undefined)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm text-start transition-colors',
                !state.category
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50',
              )}
            >
              <span>{t('all', { ns: 'common', defaultValue: 'All' })}</span>
              {counts && <span className="text-xs">{counts.total}</span>}
            </button>
            {categories && categories.length > 0 ? (
              categories.map((cat) => {
                const count = counts?.byCategorySlug?.[cat.slug] ?? cat.product_count
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSetCategory(cat.slug)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm text-start transition-colors',
                      state.category === cat.slug
                        ? 'bg-secondary font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/50',
                    )}
                  >
                    <span>
                      {t(`categories.${cat.slug}`, { ns: 'products', defaultValue: cat.name })}
                    </span>
                    {typeof count === 'number' && <span className="text-xs">{count}</span>}
                  </button>
                )
              })
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onSetCategory('windows')}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm text-start transition-colors',
                    state.category === 'windows'
                      ? 'bg-secondary font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50',
                  )}
                >
                  <span>{t('categories.windows', { defaultValue: 'Windows' })}</span>
                  {counts && <span className="text-xs">{counts.windowsCount}</span>}
                </button>
                <button
                  type="button"
                  onClick={() => onSetCategory('office')}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm text-start transition-colors',
                    state.category === 'office'
                      ? 'bg-secondary font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50',
                  )}
                >
                  <span>{t('categories.office', { defaultValue: 'Office' })}</span>
                  {counts && <span className="text-xs">{counts.officeCount}</span>}
                </button>
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Variant Accordion */}
        <AccordionItem value="variant" className="border-border/40">
          <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-2">
            {t('variant', { defaultValue: 'License Variant' })}
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-1 space-y-1">
            <button
              type="button"
              onClick={() => onSetVariant(undefined)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm text-start transition-colors',
                !state.variant
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50',
              )}
            >
              <span>{t('all', { ns: 'common', defaultValue: 'All' })}</span>
            </button>
            <button
              type="button"
              onClick={() => onSetVariant('retail')}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm text-start transition-colors',
                state.variant === 'retail'
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50',
              )}
            >
              <span>{t('variants.retail', { defaultValue: 'Retail' })}</span>
              {counts && <span className="text-xs">{counts.retailCount}</span>}
            </button>
            <button
              type="button"
              onClick={() => onSetVariant('oem')}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm text-start transition-colors',
                state.variant === 'oem'
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50',
              )}
            >
              <span>{t('variants.oem', { defaultValue: 'OEM' })}</span>
              {counts && <span className="text-xs">{counts.oemCount}</span>}
            </button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  )
}
