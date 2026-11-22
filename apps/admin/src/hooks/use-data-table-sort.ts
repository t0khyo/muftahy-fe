import * as React from 'react'
import { sortData, type SortConfig, type SortDirection } from '../lib/table-sort'

export function useDataTableSort<T>(
  items: T[],
  initialSort?: SortConfig | null,
  customAccessors?: Record<string, (item: T) => unknown>
) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(initialSort ?? null)

  const toggleSort = React.useCallback((column: string) => {
    setSortConfig((prev) => {
      if (prev?.column === column) {
        if (prev.direction === 'asc') {
          return { column, direction: 'desc' }
        }
        return null // Reset to default unsorted state
      }
      return { column, direction: 'asc' }
    })
  }, [])

  const setSort = React.useCallback((column: string, direction: SortDirection) => {
    setSortConfig({ column, direction })
  }, [])

  const clearSort = React.useCallback(() => {
    setSortConfig(null)
  }, [])

  const sortedItems = React.useMemo(() => {
    return sortData(items, sortConfig, customAccessors)
  }, [items, sortConfig, customAccessors])

  return {
    sortedItems,
    sortConfig,
    toggleSort,
    setSort,
    clearSort,
  }
}

