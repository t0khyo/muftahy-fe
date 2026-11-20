import { useTranslation } from 'react-i18next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion'
import { Switch } from '@workspace/ui/components/switch'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import type { ProductCategory, StockStatus } from '@workspace/domain/schemas/product'
import type { ProductFiltersState } from '../hooks/use-product-filters'
import type { FilterCounts } from '../hooks/use-filter-counts'

export interface FilterSidebarProps {
  state: ProductFiltersState
  counts?: FilterCounts
  activeFiltersCount: number
  onSetCategory: (cat?: ProductCategory) => void
  onSetVariant: (variant?: 'retail' | 'oem') => void
  onSetStockStatus: (status?: StockStatus) => void
  onSetInStockOnly: (val: boolean) => void
  onClearAll: () => void
  className?: string
}

export function FilterSidebar({
  state,
  counts,
  activeFiltersCount,
  onSetCategory,
  onSetVariant,
  onSetStockStatus,
  onSetInStockOnly,
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
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
              {activeFiltersCount}
            </span>
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
        defaultValue={['category', 'variant', 'availability']}
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

        {/* Availability Accordion */}
        <AccordionItem value="availability" className="border-border/40">
          <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-2">
            {t('stock.availability', { defaultValue: 'Availability' })}
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-2 space-y-3">
            <label
              htmlFor="filter-instock-toggle"
              className="flex min-h-[36px] cursor-pointer items-center justify-between gap-3 select-none"
            >
              <span className="text-sm font-normal text-foreground">
                {t('listing.inStockOnly', { defaultValue: 'In stock only' })}
              </span>
              <Switch
                id="filter-instock-toggle"
                checked={state.inStockOnly}
                onCheckedChange={onSetInStockOnly}
              />
            </label>

            <button
              type="button"
              onClick={() =>
                onSetStockStatus(
                  state.stockStatus === 'preorder' ? undefined : 'preorder',
                )
              }
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm text-start transition-colors',
                state.stockStatus === 'preorder'
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50',
              )}
            >
              <span>{t('stock.preorder', { defaultValue: 'Preorder Allowed' })}</span>
              {counts && <span className="text-xs">{counts.preorderCount}</span>}
            </button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  )
}
