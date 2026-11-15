# products/hooks

## Overview

React Query hooks that form the data-fetching boundary between UI components and the product service layer. All product data in the storefront flows through these hooks; components never call the service directly.

## Interface

- `useProducts(options: UseProductsOptions): UseQueryResult<Product[]>` — fetches a filtered list of products via `productService.list(filter)`. Query key: `['products', filter]`.
- `useProductCollection(options: UseProductCollectionOptions): UseQueryResult<Product[]>` — fetches products for a named collection (e.g. `'best-sellers'`, `'deals'`, `'new'`) via `productService.listByCollection(collection)`. Query key: `['products', 'collection', collection]`.
- `UseProductsOptions` — `{ filter?: ProductListFilter; enabled?: boolean }`
- `UseProductCollectionOptions` — `{ collection: ProductCollection; enabled?: boolean }`

## Invariants

- Both hooks obtain the product service singleton from `getProductService()` on every render; swapping the mock for a real adapter requires only a change inside `@workspace/api/factory`.
- `enabled` defaults to `true`; callers can pass `enabled: false` to defer fetching (used by `SearchPanel` while the query is empty).
- Stale time is set globally to 5 minutes in `app/query-client.ts`; retries are limited to 1.

## Side Effects

- Initiates network/mock I/O via TanStack Query on mount (or when dependencies change).
- Results are cached in the shared `QueryClient` instance; cache is shared across all components that use the same key.

## Verification

- Run: `pnpm test`
