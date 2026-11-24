import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@workspace/ui/lib/utils'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@workspace/ui/components/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

export interface DataTablePaginationProps {
  page: number
  pageSize: number
  totalItems: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  className?: string
}

function getPageRange(
  current: number,
  total: number
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 'ellipsis-end', total]
  }

  if (current >= total - 2) {
    return [1, 'ellipsis-start', total - 3, total - 2, total - 1, total]
  }

  return [1, 'ellipsis-start', current - 1, current, current + 1, 'ellipsis-end', total]
}

export function DataTablePagination({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className,
}: DataTablePaginationProps) {
  const { t } = useTranslation(['admin'])

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startRecord = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, totalItems)

  const pageRange = React.useMemo(
    () => getPageRange(page, totalPages),
    [page, totalPages]
  )

  const pageSizeItems = React.useMemo(() => {
    return pageSizeOptions.map((size) => ({
      value: String(size),
      label: String(size),
    }))
  }, [pageSizeOptions])

  const canPrevious = page > 1
  const canNext = page < totalPages

  return (
    <div
      data-slot="data-table-pagination"
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/40 bg-muted/5 text-xs text-muted-foreground',
        className
      )}
    >
      {/* Leading summary text */}
      <div className="font-mono text-xs tabular-nums text-muted-foreground">
        {t('admin:common.paginationSummary', {
          start: startRecord,
          end: endRecord,
          total: totalItems,
          defaultValue: `Showing ${startRecord}–${endRecord} of ${totalItems} results`,
        })}
      </div>

      {/* Trailing controls: Rows per page selector + Pagination navigation */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {t('admin:common.rowsPerPage', 'Rows per page')}
          </span>
          <Select
            items={pageSizeItems}
            value={String(pageSize)}
            onValueChange={(val) => {
              if (val) onPageSizeChange(Number(val))
            }}
          >
            <SelectTrigger
              className="h-8 w-[72px] text-xs font-mono tabular-nums bg-background border-border/70 cursor-pointer"
              aria-label={t('admin:common.rowsPerPage', 'Rows per page')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {pageSizeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="text-xs font-mono tabular-nums">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* shadcn Pagination */}
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                text={t('admin:common.previous', 'Previous')}
                onClick={(e) => {
                  e.preventDefault()
                  if (canPrevious) onPageChange(page - 1)
                }}
                className={cn(
                  'cursor-pointer',
                  !canPrevious && 'pointer-events-none opacity-40 select-none'
                )}
                aria-disabled={!canPrevious}
              />
            </PaginationItem>

            {pageRange.map((item, index) => {
              if (item === 'ellipsis-start' || item === 'ellipsis-end') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }

              const isCurrent = item === page

              return (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    isActive={isCurrent}
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(item)
                    }}
                    className="cursor-pointer font-mono text-xs tabular-nums"
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                text={t('admin:common.next', 'Next')}
                onClick={(e) => {
                  e.preventDefault()
                  if (canNext) onPageChange(page + 1)
                }}
                className={cn(
                  'cursor-pointer',
                  !canNext && 'pointer-events-none opacity-40 select-none'
                )}
                aria-disabled={!canNext}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

