# features/design

## Overview

Design system showcase page, served at `/:lang/design`. Renders a comprehensive gallery of all shadcn/Base UI components (buttons, badges, alerts, cards, inputs, selects, tables) alongside `ProductCard` and `ProductCardSkeleton` using `SAMPLE_PRODUCTS`. Exists for development/QA purposes only and is not linked from the public storefront navigation.

## Interface

- `DesignPage()` — the single exported component; uses `useTranslation` for the `design` namespace.

## Invariants

- Uses `SAMPLE_PRODUCTS` from `features/products/components/sample-data.ts` — all product data is obviously fake.
- Not accessible from any public nav link; reachable only via direct URL (`/:lang/design`).

## Side Effects

- No network calls, no store mutations.

## Verification

- Run: `pnpm test`
