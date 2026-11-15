# routes

## Overview

Thin route modules wired into the React Router `BrowserRouter`. Each file exports a single route component that delegates immediately to a feature or page component; no business logic lives here. Routes obtain locale from the `:lang` URL param, not from props.

## Interface

- `HomeRoute()` — renders `<HomePage renderProductRail={(props) => <ProductRail {...props} />} />`.
- `ProductsRoute()` — renders a page heading (translated `products.title`) and `<ProductGrid />`.
- `SearchRoute()` — reads `?q=` search param, fetches via `useProducts`, renders `ProductCard` grid or `ProductCardSkeleton` loading state.
- `CartRoute()` — reads `useCartStore` count; renders a placeholder cart page. Full checkout UI is unimplemented.
- `DesignRoute()` — renders `<DesignPage />` (dev-only design system showcase).

## Invariants

- Route components contain no data-fetching logic or store mutations — they delegate entirely to feature components.
- Locale is read from `useParams()` within feature components, not passed as props from route modules.
- `CartRoute` and `SearchRoute` are placeholder implementations; full functionality is pending.

## Side Effects

- `SearchRoute`: triggers `useProducts` fetch on mount/query change.
- `CartRoute`: reads `useCartStore` (no mutations).

## Verification

- Run: `pnpm test`
