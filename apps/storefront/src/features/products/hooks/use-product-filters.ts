import * as React from 'react'
import { useSearchParams } from 'react-router'
import type { ProductCategory, StockStatus } from '@workspace/domain/schemas/product'
import type { ProductCatalogFilters } from './use-products'

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest'

export interface ProductFiltersState {
  category?: ProductCategory
  variant?: 'retail' | 'oem'
  stockStatus?: StockStatus
  inStockOnly: boolean
  sort: SortOption
  search?: string
  page: number
}

export interface ActiveFilterChip {
  id: string
  type: 'category' | 'variant' | 'stock'
  value?: string
  labelFallback: string
}

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryParam = searchParams.get('category') as ProductCategory | null
  const category: ProductCategory | undefined =
    categoryParam === 'windows' || categoryParam === 'office' ? categoryParam : undefined

  const variantParam = searchParams.get('variant') as 'retail' | 'oem' | null
  const variant: 'retail' | 'oem' | undefined =
    variantParam === 'retail' || variantParam === 'oem' ? variantParam : undefined

  const stockParam = searchParams.get('stock') as StockStatus | null
  const stockStatus: StockStatus | undefined =
    stockParam === 'in_stock' || stockParam === 'preorder' || stockParam === 'out_of_stock'
      ? stockParam
      : undefined

  const inStockOnly = searchParams.get('inStock') === 'true' || searchParams.get('inStock') === '1'

  const sortParam = searchParams.get('sort') as SortOption | null
  const validSorts: SortOption[] = ['featured', 'price-asc', 'price-desc', 'newest']
  const sort: SortOption = sortParam && validSorts.includes(sortParam) ? sortParam : 'featured'

  const pageParam = searchParams.get('page')
  const page = pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0 ? Number(pageParam) : 1

  const search = searchParams.get('q') || undefined

  const filtersState: ProductFiltersState = React.useMemo(
    () => ({
      category,
      variant,
      stockStatus,
      inStockOnly,
      sort,
      search,
      page,
    }),
    [category, variant, stockStatus, inStockOnly, sort, search, page],
  )

  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (variant) count += 1
    if (stockStatus) count += 1
    if (inStockOnly) count += 1
    return count
  }, [variant, stockStatus, inStockOnly])

  const updateParams = React.useCallback(
    (updates: Record<string, string | null | undefined>, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(updates)) {
            next.delete(key)
            if (value !== null && value !== undefined && value.trim() !== '') {
              next.set(key, value.trim())
            }
          }
          if (resetPage) {
            next.delete('page')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setCategory = React.useCallback(
    (cat?: ProductCategory) => {
      updateParams({ category: cat ?? null })
    },
    [updateParams],
  )

  const setVariant = React.useCallback(
    (v?: 'retail' | 'oem') => {
      updateParams({ variant: v ?? null })
    },
    [updateParams],
  )

  const setStockStatus = React.useCallback(
    (s?: StockStatus) => {
      updateParams({ stock: s ?? null })
    },
    [updateParams],
  )

  const setInStockOnly = React.useCallback(
    (val: boolean) => {
      updateParams({ inStock: val ? 'true' : null })
    },
    [updateParams],
  )

  const setSort = React.useCallback(
    (newSort: SortOption) => {
      updateParams({ sort: newSort === 'featured' ? null : newSort }, false)
    },
    [updateParams],
  )

  const setPage = React.useCallback(
    (newPage: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (newPage <= 1) {
            next.delete('page')
          } else {
            next.set('page', String(newPage))
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const clearAll = React.useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams()
        const q = prev.get('q')
        if (q) next.set('q', q)
        const cat = prev.get('category')
        if (cat) next.set('category', cat)
        return next
      },
      { replace: true },
    )
  }, [setSearchParams])

  const queryFilter: ProductCatalogFilters = React.useMemo(
    () => ({
      category,
      variant,
      stock_status: stockStatus,
      inStockOnly,
      sort,
      search,
    }),
    [category, variant, stockStatus, inStockOnly, sort, search],
  )

  return {
    state: filtersState,
    queryFilter,
    activeFiltersCount,
    setCategory,
    setVariant,
    setStockStatus,
    setInStockOnly,
    setSort,
    setPage,
    clearAll,
  }
}
