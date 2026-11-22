import type * as React from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { SortConfig } from '../lib/table-sort'

export interface DataTableColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  column: string
  title: string
  sortConfig: SortConfig | null
  onSort: (column: string) => void
  align?: 'start' | 'center' | 'end'
}

export function DataTableColumnHeader({
  column,
  title,
  sortConfig,
  onSort,
  className,
  align = 'start',
  ...props
}: DataTableColumnHeaderProps) {
  const isSorted = sortConfig?.column === column
  const direction = isSorted ? sortConfig.direction : null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSort(column)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSort(column)
        }
      }}
      aria-sort={isSorted ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn(
        'group inline-flex items-center gap-1.5 cursor-pointer select-none font-mono text-[11px] uppercase tracking-wider transition-colors hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs',
        isSorted ? 'text-foreground font-semibold' : 'text-muted-foreground',
        align === 'end' && 'flex-row-reverse justify-end',
        align === 'center' && 'justify-center',
        className
      )}
      {...props}
    >
      <span>{title}</span>
      <span className="shrink-0 text-muted-foreground group-hover:text-foreground">
        {direction === 'asc' ? (
          <ArrowUp className="size-3 text-primary stroke-[2.5]" aria-hidden="true" />
        ) : direction === 'desc' ? (
          <ArrowDown className="size-3 text-primary stroke-[2.5]" aria-hidden="true" />
        ) : (
          <ArrowUpDown className="size-3 opacity-40 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
        )}
      </span>
    </div>
  )
}

