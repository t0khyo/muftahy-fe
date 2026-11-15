# Domain Schemas

## Overview

Zod schemas and TypeScript types for all core domain objects. This is the single source of truth for the shape of product data across the entire monorepo. Both runtime validation and static TypeScript types are derived from these schemas via `z.infer`.

## Interface

- `supportedCurrencySchema` / `MoneyValue` — enum of supported ISO 4217 currency codes; `moneySchema` enforces `amountMinor` as a non-negative integer
- `productCategorySchema` / `ProductCategory` — `'games' | 'software' | 'subscriptions' | 'gift-cards'`
- `productPlatformSchema` / `ProductPlatform` — `'steam' | 'playstation' | 'xbox' | 'nintendo' | 'pc' | 'microsoft'`
- `productRegionSchema` / `ProductRegion` — `'global' | 'gcc' | 'eg' | 'mena' | 'us' | 'eu'`
- `localizedStringSchema` / `LocalizedString` — `{ en: string; ar: string }` both non-empty
- `productSchema` / `Product` — full product shape including bilingual title/description, price (minor units), optional `originalPrice`, delivery type, stock flag, and featured flag
- `productCollectionSchema` / `ProductCollection` — `'best-sellers' | 'deals' | 'new'`
- `productListFilterSchema` / `ProductListFilter` — optional filter bag for category, platform, region, collection, free-text search, and featured flag

## Invariants

- `amountMinor` is always a non-negative integer — floating-point money values are rejected at the schema level.
- `LocalizedString` requires both `en` and `ar` to be non-empty strings — partial translations are invalid.
- `deliveryType` defaults to `'instant'`; `featured` defaults to `false`.
- `coverImage` accepts either an absolute URL or a path starting with `/`.

## Side Effects

- No side effects. Schema validation is pure and synchronous.

## Verification

- Run: `pnpm test`
