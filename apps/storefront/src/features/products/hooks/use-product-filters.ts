import * as React from 'react'
import { useSearchParams } from 'react-router'
import type {
  ProductCategory,
  ProductListFilter,
  ProductPlatform,
  ProductRegion,
  ProductSortOption,
} from '@workspace/domain/schemas/product'

export interface ProductFiltersState {
  categories: ProductCategory[]
  platforms: ProductPlatform[]
  regions: ProductRegion[]
  priceMin?: number
  priceMax?: number
  inStock: boolean
  onSale: boolean
  sort: ProductSortOption
  page: number
  search?: string
}

export interface ActiveFilterChip {
  id: string
  type: 'category' | 'platform' | 'region' | 'price' | 'inStock' | 'onSale'
  value?: string
  labelKey?: string
  labelFallback: string
}

function parseArrayParam<T extends string>(searchParams: URLSearchParams, param: string): T[] {
  const raw = searchParams.getAll(param)
  return raw
    .flatMap((item) => item.split(','))
    .map((s) => s.trim())
    .filter(Boolean) as T[]
}

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const categories = React.useMemo(
    () => parseArrayParam<ProductCategory>(searchParams, 'category'),
    [searchParams],
  )
  const platforms = React.useMemo(
    () => parseArrayParam<ProductPlatform>(searchParams, 'platform'),
    [searchParams],
  )
  const regions = React.useMemo(
    () => parseArrayParam<ProductRegion>(searchParams, 'region'),
    [searchParams],
  )

  const priceMinParam = searchParams.get('minPrice')
  const priceMaxParam = searchParams.get('maxPrice')
  const priceMin = priceMinParam && !isNaN(Number(priceMinParam)) ? Number(priceMinParam) : undefined
  const priceMax = priceMaxParam && !isNaN(Number(priceMaxParam)) ? Number(priceMaxParam) : undefined

  const inStock = searchParams.get('inStock') === 'true' || searchParams.get('inStock') === '1'
  const onSale = searchParams.get('onSale') === 'true' || searchParams.get('onSale') === '1'

  const sortParam = searchParams.get('sort') as ProductSortOption | null
  const validSorts: ProductSortOption[] = ['featured', 'best-selling', 'price-asc', 'price-desc', 'newest']
  const sort: ProductSortOption = sortParam && validSorts.includes(sortParam) ? sortParam : 'featured'

  const pageParam = searchParams.get('page')
  const page = pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0 ? Number(pageParam) : 1

  const search = searchParams.get('q') || undefined

  const filtersState: ProductFiltersState = React.useMemo(
    () => ({
      categories,
      platforms,
      regions,
      priceMin,
      priceMax,
      inStock,
      onSale,
      sort,
      page,
      search,
    }),
    [categories, platforms, regions, priceMin, priceMax, inStock, onSale, sort, page, search],
  )

  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    count += platforms.length
    count += regions.length
    if (priceMin !== undefined || priceMax !== undefined) count += 1
    if (inStock) count += 1
    if (onSale) count += 1
    return count
  }, [platforms, regions, priceMin, priceMax, inStock, onSale])

  // Helper to update search params while preserving unrelated ones
  const updateParams = React.useCallback(
    (updates: Record<string, string | string[] | null | undefined>, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(updates)) {
            next.delete(key)
            if (value === null || value === undefined) {
              // already deleted
            } else if (Array.isArray(value)) {
              if (value.length > 0) {
                next.set(key, value.join(','))
              }
            } else if (value.trim() !== '') {
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

  const toggleCategory = React.useCallback(
    (cat: ProductCategory) => {
      const next = categories.includes(cat)
        ? categories.filter((c) => c !== cat)
        : [...categories, cat]
      updateParams({ category: next })
    },
    [categories, updateParams],
  )

  const togglePlatform = React.useCallback(
    (plat: ProductPlatform) => {
      const next = platforms.includes(plat)
        ? platforms.filter((p) => p !== plat)
        : [...platforms, plat]
      updateParams({ platform: next })
    },
    [platforms, updateParams],
  )

  const toggleRegion = React.useCallback(
    (reg: ProductRegion) => {
      const next = regions.includes(reg)
        ? regions.filter((r) => r !== reg)
        : [...regions, reg]
      updateParams({ region: next })
    },
    [regions, updateParams],
  )

  const setPriceRange = React.useCallback(
    (min?: number, max?: number) => {
      updateParams({
        minPrice: min !== undefined ? String(min) : null,
        maxPrice: max !== undefined ? String(max) : null,
      })
    },
    [updateParams],
  )

  const setInStock = React.useCallback(
    (val: boolean) => {
      updateParams({ inStock: val ? 'true' : null })
    },
    [updateParams],
  )

  const setOnSale = React.useCallback(
    (val: boolean) => {
      updateParams({ onSale: val ? 'true' : null })
    },
    [updateParams],
  )

  const setSort = React.useCallback(
    (newSort: ProductSortOption) => {
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
        // preserve search query 'q' and 'category' if present
        const q = prev.get('q')
        if (q) next.set('q', q)
        const category = prev.get('category')
        if (category) next.set('category', category)
        return next
      },
      { replace: true },
    )
  }, [setSearchParams])

  const removeFilter = React.useCallback(
    (type: ActiveFilterChip['type'], value?: string) => {
      switch (type) {
        case 'category':
          if (value) toggleCategory(value as ProductCategory)
          break
        case 'platform':
          if (value) togglePlatform(value as ProductPlatform)
          break
        case 'region':
          if (value) toggleRegion(value as ProductRegion)
          break
        case 'price':
          setPriceRange(undefined, undefined)
          break
        case 'inStock':
          setInStock(false)
          break
        case 'onSale':
          setOnSale(false)
          break
      }
    },
    [toggleCategory, togglePlatform, toggleRegion, setPriceRange, setInStock, setOnSale],
  )

  // Convert to ProductListFilter format for service query
  const queryFilter: ProductListFilter = React.useMemo(
    () => ({
      category: categories.length > 0 ? categories : undefined,
      platform: platforms.length > 0 ? platforms : undefined,
      region: regions.length > 0 ? regions : undefined,
      priceMin,
      priceMax,
      inStock: inStock ? true : undefined,
      onSale: onSale ? true : undefined,
      sort,
      page,
      pageSize: 24,
      search,
    }),
    [categories, platforms, regions, priceMin, priceMax, inStock, onSale, sort, page, search],
  )

  return {
    state: filtersState,
    queryFilter,
    activeFiltersCount,
    toggleCategory,
    togglePlatform,
    toggleRegion,
    setPriceRange,
    setInStock,
    setOnSale,
    setSort,
    setPage,
    clearAll,
    removeFilter,
  }
}
