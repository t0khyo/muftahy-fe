# Domain Schemas

## Overview

Zod schemas and TypeScript types for all core domain objects. This is the single source of truth for the shape of product data across the entire monorepo. Both runtime validation and static TypeScript types are derived from these schemas via `z.infer`.

## Interface

- `[product.ts:supportedCurrencySchema]` / `[product.ts:MoneyValue]` — enum of supported ISO 4217 currency codes; `[product.ts:moneySchema]` validates `amountMinor` (non-negative integer) and `currency`
- `[product.ts:productCategorySchema]` / `[product.ts:ProductCategory]` — `'games' | 'software' | 'subscriptions' | 'gift-cards'`
- `[product.ts:productPlatformSchema]` / `[product.ts:ProductPlatform]` — `'steam' | 'playstation' | 'xbox' | 'nintendo' | 'pc' | 'microsoft'`
- `[product.ts:productRegionSchema]` / `[product.ts:ProductRegion]` — `'global' | 'gcc' | 'eg' | 'mena' | 'us' | 'eu'`
- `[product.ts:localizedStringSchema]` / `[product.ts:LocalizedString]` — `{ en: string; ar: string }` where both are non-empty strings
- `[product.ts:productPlanSchema]` / `[product.ts:ProductPlan]` — product edition/tier schema (`id`, `slug`, `title`, `price`, `stock`, `deliveryType`)
- `[product.ts:productSpecsSchema]` / `[product.ts:ProductSpecs]` — technical specifications (developer, publisher, releaseDate, languages, requirements)
- `[product.ts:productFaqItemSchema]` / `[product.ts:ProductFaqItem]` — FAQ item with bilingual question and answer
- `[product.ts:productMediaItemSchema]` / `[product.ts:ProductMediaItem]` — media assets (type 'image' | 'video', url, optional alt/thumbnail)
- `[product.ts:productSchema]` / `[product.ts:Product]` — full product entity schema including bilingual fields, plans, specs, FAQs, and tags
- `[product.ts:getSummaryPlan]` `(product: Product): ProductPlan` — helper resolving the primary active or default plan for display
- `[product.ts:productCollectionSchema]` / `[product.ts:ProductCollection]` — `'best-sellers' | 'deals' | 'new'`
- `[product.ts:productSortOptionSchema]` / `[product.ts:ProductSortOption]` — `'featured' | 'best-selling' | 'price-asc' | 'price-desc' | 'newest'`
- `[product.ts:productListFilterSchema]` / `[product.ts:ProductListFilter]` — filter bag for catalog filtering and pagination
- `[product.ts:ProductListResult]` — paginated response envelope (`items`, `total`, `page`, `pageSize`, `hasMore`)
- `[product.ts:FilterOptionCount]` / `[product.ts:ProductFilterCounts]` — faceted search filter count interfaces

## Invariants

- `[product.ts:moneySchema]` `amountMinor` must be a non-negative integer — floating-point money values are rejected at schema validation.
- `[product.ts:localizedStringSchema]` Both `en` and `ar` must be non-empty strings (`min(1)`); partial translations are disallowed.
- `[product.ts:productSchema]` `deliveryType` defaults to `'instant'`; `featured` defaults to `false`.
- `[product.ts:productSchema]` `coverImage` requires an absolute URL or path starting with `/`.
- `[product.ts:getSummaryPlan]` Prioritizes in-stock default plan, first in-stock plan, or first defined plan; generates fallback default plan if none exists.
- `[product.ts:productListFilterSchema]` `page` and `pageSize` must be positive integers if specified.

## Side Effects

- None. Schema validation and plan derivation are pure and synchronous.

## Verification

- Run: `pnpm test`
