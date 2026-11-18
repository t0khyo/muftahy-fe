# features

## Overview

Feature modules for the Muftahy storefront. Each subdirectory owns the components, pages, hooks, utilities, and tests for one product domain area. Features import from `packages/*` and from `components/` but never from each other (cross-feature imports are prohibited).

## Subdirectories & Boundaries

- **cart**: [`./cart/README.md`](./cart/README.md) — Shopping cart state store (`useCartStore`), line item rows (`CartLineItem`), and multi-currency selectors (`getCurrencySubtotals`).
- **design**: [`./design/README.md`](./design/README.md) — `DesignPage` component showcase gallery (dev/QA only).
- **home**: [`./home/README.md`](./home/README.md) — Home page sections driven by `home.config.ts` (`HomePage`, `HeroSection`, `BrowseSection`, `BundlesSection`, `CategoryTiles`, `PlatformStrip`, `TrustStrip`, `HowItWorksSection`, `SocialProofSection`, `SupportSection`, `FaqSection`).
- **products**: [`./products/README.md`](./products/README.md) — Product catalog components, detail views (`ProductDetailPage`), filter sidebar/sheet, and TanStack Query hooks (`useProducts`, `useProduct`, `useProductFilters`).

## Verification

- Run: `pnpm test`
