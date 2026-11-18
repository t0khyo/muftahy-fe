# ProductService

## Overview

Defines the `ProductService` TypeScript interface — the primary architectural seam between the frontend application and product data. All hooks and components that need product data depend on this interface, never on a concrete adapter directly. The factory selects the active implementation at runtime.

## Interface

- `[product-service.ts:ProductService]` `interface ProductService`
  - `[product-service.ts:ProductService.list]` `list(filter?: ProductListFilter): Promise<ProductListResult>` — returns paginated product result matching criteria
  - `[product-service.ts:ProductService.listByCollection]` `listByCollection(collection: ProductCollection): Promise<Product[]>` — returns products for a named collection ('best-sellers', 'deals', 'new')
  - `[product-service.ts:ProductService.getFilterCounts]` `getFilterCounts(filter?: ProductListFilter): Promise<ProductFilterCounts>` — returns aggregated facet counts for filters
  - `[product-service.ts:ProductService.getBySlug]` `getBySlug(slug: string): Promise<Product | null>` — lookup by URL slug; returns `null` when not found
  - `[product-service.ts:ProductService.getById]` `getById(id: string): Promise<Product | null>` — lookup by ID; returns `null` when not found
  - `[product-service.ts:ProductService.getSampleLicenseKey]` `getSampleLicenseKey(productId: string): Promise<string>` — returns an obfuscated mock key string

## Invariants

- All methods return Promises; asynchronous execution is guaranteed across all implementations.
- `getBySlug` and `getById` return `null` (never throw) when the requested entity is absent.
- `getSampleLicenseKey` returns a simulated key for reveal/copy interaction tests without exposing actual licenses.

## Side Effects

- Interface definitions only. Concrete side effects are delegated to adapter implementations.

## Verification

- Run: `pnpm test`
