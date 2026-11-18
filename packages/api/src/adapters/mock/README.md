# MockProductAdapter

## Overview

In-memory mock implementation of `ProductService`. Ships a static dataset of representative products (games, software, gift cards, subscriptions) covering EGP, USD, and SAR currencies, multiple platforms, and both GCC and global regions. This adapter serves as the primary data source until a real HTTP backend is configured via `factory.ts`.

## Interface

- `[product-mock-adapter.ts:MOCK_PRODUCTS]` `const MOCK_PRODUCTS: Product[]` — exported static product catalogue
- `[product-mock-adapter.ts:MockProductAdapter]` `class MockProductAdapter implements ProductService`
  - `[product-mock-adapter.ts:MockProductAdapter.list]` `async list(filter?: ProductListFilter): Promise<ProductListResult>` — in-memory filtering, sorting, and pagination
  - `[product-mock-adapter.ts:MockProductAdapter.getFilterCounts]` `async getFilterCounts(_filter?: ProductListFilter): Promise<ProductFilterCounts>` — returns aggregated facet counts
  - `[product-mock-adapter.ts:MockProductAdapter.listByCollection]` `async listByCollection(collection: ProductCollection): Promise<Product[]>` — returns up to 8 items for 'best-sellers', 'deals', or 'new'
  - `[product-mock-adapter.ts:MockProductAdapter.getBySlug]` `async getBySlug(slug: string): Promise<Product | null>` — lookup product by unique slug
  - `[product-mock-adapter.ts:MockProductAdapter.getById]` `async getById(id: string): Promise<Product | null>` — lookup product by unique ID
  - `[product-mock-adapter.ts:MockProductAdapter.getSampleLicenseKey]` `async getSampleLicenseKey(_productId: string): Promise<string>` — returns a mock license key

## Invariants

- `[product-mock-adapter.ts:MockProductAdapter.getSampleLicenseKey]` Always returns the fixed mock license key string `'XXXXX-XXXXX-XXXXX'`. Real keys are never used.
- `[product-mock-adapter.ts:MockProductAdapter.list]` Default sort order falls back to `'featured'` when `filter?.sort` is undefined.
- `[product-mock-adapter.ts:MockProductAdapter.list]` Default `page` is 1 and default `pageSize` is 24 when unspecified.
- `[product-mock-adapter.ts:MockProductAdapter.listByCollection]` Always caps returned collections to at most 8 items via `.slice(0, 8)`.
- `[product-mock-adapter.ts:MockProductAdapter.getFilterCounts]` Excludes zero-count options and sorts counts descending.
- In-memory data is never mutated; filtering operates on non-destructive array passes.

## Side Effects

- None. Pure in-memory operations with no network or persistent disk storage.

## Verification

- Run: `pnpm test`
