# MockProductAdapter

## Overview

In-memory mock implementation of `ProductService`. Ships a static dataset of eight representative products (games, software, gift cards, subscriptions) covering EGP, USD, and SAR currencies, multiple platforms, and both GCC and global regions. This adapter is the sole data source until a real HTTP backend is wired in via `factory.ts`.

## Interface

- `MOCK_PRODUCTS: Product[]` — exported constant; the full static product catalogue (8 items)
- `MockProductAdapter` — class implementing `ProductService`:
  - `list(filter?)` — filters in-memory by category, platform, region, featured, and free-text search across `title.en`, `title.ar`, and `slug`
  - `listByCollection(collection)` — `best-sellers`: featured/in-stock top-8; `deals`: items with a discounted `originalPrice` top-8; `new`: reverse insertion order top-8
  - `getBySlug(slug)` — linear scan; returns `null` on miss
  - `getById(id)` — linear scan; returns `null` on miss
  - `getSampleLicenseKey(_productId)` — always returns `'XXXXX-XXXXX-XXXXX'`

## Invariants

- Product amounts are stored as minor units (integers); no floating-point arithmetic is used for money.
- All mock keys and codes are obviously fake (`XXXXX-XXXXX-XXXXX`); no real or realistic keys appear in this file.
- `MOCK_PRODUCTS` is never mutated; each `list` call copies the array before filtering.
- Titles and descriptions must have both `en` and `ar` values (enforced by the `Product` schema).

## Side Effects

- Pure in-memory — no network calls, no disk access, no external state mutations.

## Verification

- Run: `pnpm test`
