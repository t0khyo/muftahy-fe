# ProductService

## Overview

Defines the `ProductService` TypeScript interface — the single seam between the application and product data. All hooks and components that need product data depend on this interface, never on a concrete implementation. The factory (`packages/api/src/factory.ts`) selects the active implementation at runtime.

## Interface

- `ProductService` — interface with five async methods:
  - `list(filter?: ProductListFilter): Promise<Product[]>` — returns all products, optionally filtered by category, platform, region, featured flag, or free-text search
  - `listByCollection(collection: ProductCollection): Promise<Product[]>` — returns up to 8 products for a named collection (`best-sellers`, `deals`, `new`)
  - `getBySlug(slug: string): Promise<Product | null>` — lookup by URL slug; returns `null` when not found
  - `getById(id: string): Promise<Product | null>` — lookup by opaque ID; returns `null` when not found
  - `getSampleLicenseKey(productId: string): Promise<string>` — returns an obviously fake placeholder key for display purposes

## Invariants

- All methods return Promises; callers must not expect synchronous results.
- `list` with no filter must return all available products.
- `getBySlug` and `getById` return `null` (never throw) when a product is absent.
- `getSampleLicenseKey` must return an obviously fake key (e.g., `XXXXX-XXXXX-XXXXX`); real keys must never appear here.

## Side Effects

- Interface only — no side effects are defined here. Side effects are delegated to implementations.

## Verification

- Run: `pnpm test`
