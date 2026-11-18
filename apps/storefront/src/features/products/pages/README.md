# products/pages

## Overview

Page-level container components for the product catalog feature. Integrates child detail components (media, buy box, info sections, related products, mobile sticky bar) with data hooks and global cart state.

## Interface

- `ProductDetailPage()` — full product detail page view coordinating product media, buy box, specifications, FAQ, related items rail, and mobile sticky actions.

## Invariants

- `[product-detail-page.tsx:selectedPlan]` Defaults to `getSummaryPlan(product)` when `?plan=` query parameter is absent or does not match any valid plan slug.
- `[product-detail-page.tsx:useEffect]` Normalizes URL search parameter `plan` via `setSearchParams(..., { replace: true })` whenever the query param differs from the active plan slug.
- `[product-detail-page.tsx:handleAddToCart]` Prevents adding items to cart when `selectedPlan.stock === 0`.
- `[product-detail-page.tsx:cartItemId]` Forms cart item ID using `${product.id}:${selectedPlan.id}` format.

## Side Effects

- `[product-detail-page.tsx:useProduct]` Triggers product data fetching through TanStack Query.
- `[product-detail-page.tsx:useCartStore]` Dispatches `addItem` mutation to Zustand cart store.
- `[product-detail-page.tsx:setSearchParams]` Updates browser URL query parameters.
- `[product-detail-page.tsx:IntersectionObserver]` Binds scroll/resize listeners and an `IntersectionObserver` to toggle mobile sticky bar visibility based on buy box position.
- `[product-detail-page.tsx:setTimeout]` Schedules transient 2000ms timer for accessible screen reader announcements and button state reset.

## Verification

- Run: `pnpm test`
