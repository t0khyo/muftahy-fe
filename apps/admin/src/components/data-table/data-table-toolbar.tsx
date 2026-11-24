import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from '@workspace/ui/components/input-group'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'

export interface DataTableSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

/**
 * Standardized search input with leading search icon and trailing clear button.
 * Built with official shadcn/ui InputGroup primitives.
 */
export function DataTableSearch({
  value,
  onChange,
  placeholder,
  className,
  id,
}: DataTableSearchProps) {
  const { t } = useTranslation(['admin'])

  return (
    <InputGroup
      className={cn(
        'w-full sm:w-64 h-8 bg-background border-border/70 focus-within:ring-1 focus-within:ring-ring transition-colors',
        className,
      )}
    >
      <InputGroupAddon align="inline-start">
        <Search className="size-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('admin:common.search', 'Search...')}
        className="text-xs h-7"
        autoComplete="off"
      />
      {value.trim().length > 0 && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            onClick={() => onChange('')}
            title={t('admin:common.clearSearch', 'Clear search')}
            aria-label={t('admin:common.clearSearch', 'Clear search')}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" data-icon="inline-start" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

export interface ActiveFilterChipItem {
  id: string
  label: string
  onRemove: () => void
}

export interface DataTableActiveFiltersProps {
  chips: ActiveFilterChipItem[]
  onClearAll: () => void
  className?: string
}

/**
 * Renders active filter badges with individual removal and "Clear all" button.
 */
export function DataTableActiveFilters({
  chips,
  onClearAll,
  className,
}: DataTableActiveFiltersProps) {
  const { t } = useTranslation(['admin'])

  if (chips.length === 0) return null

  return (
    <div
      role="region"
      aria-label={t('admin:common.activeFilters', 'Active filters')}
      className={cn('flex flex-wrap items-center gap-1.5 pt-1 text-xs text-muted-foreground', className)}
    >
      <span className="text-[11px] font-medium me-1">
        {t('admin:common.activeFilters', 'Active filters')}:
      </span>
      {chips.map((chip) => (
        <Badge
          key={chip.id}
          variant="secondary"
          className="gap-1 ps-2 pe-1 py-0.5 text-[11px] font-normal border border-border/60 bg-muted/60"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="rounded-full hover:bg-muted p-0.5 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${chip.label}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={onClearAll}
        className="h-6 text-[11px] text-primary hover:underline cursor-pointer px-1.5 font-medium"
      >
        {t('admin:common.clearAllFilters', 'Clear all')}
      </Button>
    </div>
  )
}

export interface DataTableToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  search?: React.ReactNode
  filters?: React.ReactNode
  views?: React.ReactNode
  actions?: React.ReactNode
  activeFilters?: React.ReactNode
}

/**
 * Standardized data table toolbar:
 * - Search is placed at the START (leading edge).
 * - Dropdown filters directly follow search.
 * - View segment tabs and table actions are placed at the END (trailing edge).
 * - Active filter badges are displayed on the secondary row beneath.
 */
export function DataTableToolbar({
  search,
  filters,
  views,
  actions,
  activeFilters,
  className,
  children,
  ...props
}: DataTableToolbarProps) {
  return (
    <div className={cn('space-y-2.5 w-full', className)} {...props}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        {/* Leading Start Side: Search at start + dropdown filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {search}
          {filters}
        </div>

        {/* Trailing End Side: Views (tabs) + Actions */}
        {(views || actions) && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {views}
            {actions}
          </div>
        )}
      </div>

      {/* Optional Custom Inset (e.g. bulk actions) */}
      {children}

      {/* Active Filter Chips Row */}
      {activeFilters}
    </div>
  )
}

