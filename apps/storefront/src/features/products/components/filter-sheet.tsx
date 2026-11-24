import { useTranslation } from 'react-i18next'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion'
import { Switch } from '@workspace/ui/components/switch'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { X } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { CategoryResponse, StockStatus } from '@workspace/domain/schemas/product'
import type { ProductFiltersState } from '../hooks/use-product-filters'
import type { FilterCounts } from '../hooks/use-filter-counts'

export interface FilterSheetProps {
  categories?: CategoryResponse[]
  open: boolean
  onOpenChange: (open: boolean) => void
  state: ProductFiltersState
  counts?: FilterCounts
  totalResults: number
  activeFiltersCount: number
  onSetCategory: (cat?: string) => void
  onSetVariant: (variant?: 'retail' | 'oem') => void
  onSetStockStatus: (status?: StockStatus) => void
  onSetInStockOnly: (val: boolean) => void
  onClearAll: () => void
}

export function FilterSheet({
  categories,
  open,
  onOpenChange,
  state,
  counts,
  totalResults,
  activeFiltersCount,
  onSetCategory,
  onSetVariant,
  onSetStockStatus,
  onSetInStockOnly,
  onClearAll,
}: FilterSheetProps) {
  const { t } = useTranslation(['products', 'common'])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="h-[85vh] max-h-[85vh] rounded-t-3xl flex flex-col p-0 gap-0 overflow-hidden bg-background border-border"
      >
        {/* Header */}
        <SheetHeader className="flex-row items-center justify-between border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-base font-semibold text-foreground">
              {t('listing.filters', { defaultValue: 'Filters' })}
            </SheetTitle>
            {activeFiltersCount > 0 && (
              <Badge className="flex size-5 items-center justify-center rounded-full p-0 text-[11px] font-medium">
                {activeFiltersCount}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
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

            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t('close', { ns: 'common', defaultValue: 'Close' })}
                  className="rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                />
              }
            >
              <X className="size-5" aria-hidden="true" />
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Scrollable Filter Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-start">
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
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-start transition-colors',
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
                          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-start transition-colors',
                          state.category === cat.slug
                            ? 'bg-secondary font-medium text-foreground'
                            : 'text-muted-foreground hover:bg-secondary/50',
                        )}
                      >
                        <span>{cat.name}</span>
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
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-start transition-colors',
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
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-start transition-colors',
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
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-start transition-colors',
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
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-start transition-colors',
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
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-start transition-colors',
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
                  htmlFor="filter-sheet-instock"
                  className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3 select-none"
                >
                  <span className="text-sm font-normal text-foreground">
                    {t('listing.inStockOnly', { defaultValue: 'In stock only' })}
                  </span>
                  <Switch
                    id="filter-sheet-instock"
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
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-start transition-colors',
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
        </div>

        {/* Footer with Apply CTA */}
        <div className="border-t border-border/40 p-4 bg-background">
          <Button
            type="button"
            className="w-full h-12 rounded-full font-medium text-sm cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            {t('listing.showResults', {
              count: totalResults,
              defaultValue: `Show ${totalResults} results`,
            })}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
