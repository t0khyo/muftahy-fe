# products/hooks

## Overview

React Query hooks and URL search parameter synchronization hooks that form the data-fetching and filtering boundary between UI components and the product service layer. All product data in the storefront flows through these hooks; components never call the service directly.

## Interface

- `useProducts(options?: UseProductsOptions): UseQueryResult<ProductListResult>` — fetches a filtered, paginated list of products via `productService.list(filter)`. Query key: `['products', filter]`.
- `useProduct(slug: string, options?: { enabled?: boolean }): UseQueryResult<Product | null>` — fetches a single product by slug via `productService.getBySlug(slug)`. Query key: `['product', slug]`.
- `useRelatedProducts(slugs: string[], options?: { enabled?: boolean }): UseQueryResult<Product[]>` — fetches multiple related products by slugs using `Promise.allSettled`. Query key: `['products', 'related', slugs]`.
- `useProductCollection(options: UseProductCollectionOptions): UseQueryResult<Product[]>` — fetches products for a named collection (e.g. `'best-sellers'`, `'deals'`, `'new'`) via `productService.listByCollection(collection)`. Query key: `['products', 'collection', collection]`.
- `useFilterCounts(options?: UseFilterCountsOptions): UseQueryResult<ProductFilterCounts>` — retrieves facet counts for active filters via `productService.getFilterCounts(filter)`. Query key: `['product-filter-counts', filter]`.
- `useProductFilters()` — parses and synchronizes filter state (categories, platforms, regions, price range, stock, sale, sort, page, search) with URL search parameters.
- `UseProductsOptions` — `{ filter?: ProductListFilter; enabled?: boolean }`.
- `UseProductCollectionOptions` — `{ collection: ProductCollection; enabled?: boolean }`.
- `UseFilterCountsOptions` — `{ filter?: ProductListFilter; enabled?: boolean }`.
- `ProductFiltersState` — `{ categories, platforms, regions, priceMin?, priceMax?, inStock, onSale, sort, page, search? }`.
- `ActiveFilterChip` — `{ id, type, value?, labelKey?, labelFallback }`.

## Invariants

- [use-products.ts:getProductService] Hooks obtain the product service singleton from `getProductService()` on invocation; swapping mock adapters for real API clients requires changes only in `@workspace/api/factory`.
- [use-products.ts:enabled] `enabled` flag defaults to `true`; callers can pass `enabled: false` to defer fetching.
- [use-product-filters.ts:sort] Defaults to `'featured'` if URL `sort` param is absent or invalid.
- [use-product-filters.ts:page] Defaults to `1` and enforces positive integer page numbers.
- Cache retention and retry limits inherit shared `QueryClient` defaults (5 min stale time, 1 retry).

## Side Effects

- `[use-products.ts:useQuery]` Initiates TanStack Query fetch operations on mount or dependency changes.
- `[use-product-filters.ts:useSearchParams]` Mutates browser URL search query parameters when filters change.
- `[use-products.ts:queryClient]` Caches responses in the shared `QueryClient` cache across subscribers.

## Verification

- Run: `pnpm test`
