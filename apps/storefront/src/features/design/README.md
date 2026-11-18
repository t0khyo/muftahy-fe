# features/design

## Overview

Design system showcase page, served at `/:lang/design`. Renders a comprehensive gallery of all shadcn/Base UI components (buttons, badges, alerts, cards, inputs, selects, tables) alongside `ProductCard` and `ProductCardSkeleton` using `SAMPLE_PRODUCTS`. Exists for development and QA purposes only and is not linked from public storefront navigation.

## Interface

- `DesignPage()` — root gallery component showcasing UI components and interactive variants across themes.

## Invariants

- `[design-page.tsx:SAMPLE_PRODUCTS]` Uses `SAMPLE_PRODUCTS` from `features/products/components/sample-data.ts` — all product data and digital keys are obviously placeholder values.
- `[design-page.tsx:route]` Not accessible via public storefront navigation; reachable only through direct URL navigation (`/:lang/design`).

## Side Effects

- None (no network requests, no state store mutations).

## Verification

- Run: `pnpm test`
