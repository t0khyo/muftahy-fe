# features

## Overview

Feature modules for the Muftahy storefront. Each subdirectory owns the components, hooks, services, and tests for one product domain area. Features import from `packages/*` and from `components/` but never from each other (cross-feature imports are prohibited).

## Subdirectories & Boundaries

- **cart**: [`./cart/README.md`](./cart/README.md) — Zustand cart store (`useCartStore`, `CartItem`, `CartState`).
- **design**: [`./design/README.md`](./design/README.md) — `DesignPage` component showcase (dev/QA only).
- **home**: [`./home/README.md`](./home/README.md) — Home page sections driven by `home.config.ts`; `HomePage`, `HeroSection`, `CategoryTiles`, `PlatformStrip`, `TrustStrip`, `FaqSection`.
- **products**: [`./products/README.md`](./products/README.md) — `ProductCard`, `ProductGrid`, `ProductRail`, `AddToCartButton`, `PlanPicker`, `useProducts`, `useProductCollection`.

## Verification

- Run: `pnpm test`
