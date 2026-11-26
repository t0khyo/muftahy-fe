import * as React from 'react'
import { useSearchParams } from 'react-router'
import type { ProductCatalogFilters } from './use-products'

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest'

export interface ProductFiltersState {
  category?: string
  variant?: 'retail' | 'oem'
  sort: SortOption
  search?: string
  page: number
}

export interface ActiveFilterChip {
  id: string
  type: 'category' | 'variant'
  value?: string
  labelFallback: string
}

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryParam = searchParams.get('category')
  const category: string | undefined =
    categoryParam && categoryParam.trim() ? categoryParam.trim() : undefined

  const variantParam = searchParams.get('variant') as 'retail' | 'oem' | null
  const variant: 'retail' | 'oem' | undefined =
    variantParam === 'retail' || variantParam === 'oem' ? variantParam : undefined

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
      sort,
      search,
      page,
    }),
    [category, variant, sort, search, page],
  )

  const activeFiltersCount = React.useMemo(() => {
    return variant ? 1 : 0
  }, [variant])

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
    (cat?: string) => {
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
      sort,
      search,
    }),
    [category, variant, sort, search],
  )

  return {
    state: filtersState,
    queryFilter,
    activeFiltersCount,
    setCategory,
    setVariant,
    setSort,
    setPage,
    clearAll,
  }
}
