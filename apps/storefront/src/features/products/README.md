# features/products

## Overview

The product catalog feature. Contains all UI components, data hooks, and display types for browsing, searching, and adding products to cart. This feature owns the presentation layer for products; business logic (domain types, schemas, service interfaces) lives in `packages/domain` and `packages/api`.

## Subdirectories & Boundaries

- **components**: [`./components/README.md`](./components/README.md) — `ProductCard`, `ProductGrid`, `ProductRail`, `AddToCartButton`, `PlanPicker`, `PlatformsRow`, loading skeletons, and static sample data.
- **hooks**: [`./hooks/README.md`](./hooks/README.md) — `useProducts` and `useProductCollection` TanStack Query hooks; the sole data-fetching boundary for this feature.

## Verification

- Run: `pnpm test`
