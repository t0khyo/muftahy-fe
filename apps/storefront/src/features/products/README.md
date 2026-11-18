# features/products

## Overview

The product catalog feature module. Contains all UI components, pages, data hooks, filter states, and display types for browsing, filtering, viewing details, and adding digital products to the cart. This feature owns the presentation layer for products; domain models and schemas live in `packages/domain`, while API services live in `packages/api`.

## Subdirectories & Boundaries

- **components**: [`./components/README.md`](./components/README.md) — `ProductCard`, `ProductGrid`, `ProductRail`, catalog toolbars, filter bars, loading skeletons, and detail sub-components.
- **hooks**: [`./hooks/README.md`](./hooks/README.md) — `useProducts`, `useProduct`, `useRelatedProducts`, `useFilterCounts`, and `useProductFilters` query and state hooks.
- **pages**: [`./pages/README.md`](./pages/README.md) — `ProductDetailPage` container orchestrating the full product detail layout and sticky mobile buy box.

## Verification

- Run: `pnpm test`
