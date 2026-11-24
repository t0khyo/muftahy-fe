import * as React from 'react'

export interface UseDataTablePaginationOptions {
  initialPage?: number
  defaultPageSize?: number
}

export function useDataTablePagination<T>(
  items: T[],
  options?: UseDataTablePaginationOptions
) {
  const { initialPage = 1, defaultPageSize = 10 } = options || {}
  const [page, setPage] = React.useState(initialPage)
  const [pageSize, setPageSize] = React.useState(defaultPageSize)

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Adjust page during render if totalPages shrinks below current page
  if (page > totalPages) {
    setPage(totalPages)
  }

  const paginatedItems = React.useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  const startRecord = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, totalItems)

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      setPage(Math.max(1, Math.min(newPage, totalPages)))
    },
    [totalPages]
  )

  const handlePageSizeChange = React.useCallback(
    (newSize: number) => {
      setPageSize(newSize)
      setPage(1)
    },
    []
  )

  const resetPage = React.useCallback(() => {
    setPage(1)
  }, [])

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    startRecord,
    endRecord,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    resetPage,
  }
}

