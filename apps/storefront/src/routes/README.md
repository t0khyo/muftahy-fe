# routes

## Overview

Thin route modules wired into the React Router `createBrowserRouter` tree. Each file exports a single route component that delegates directly to feature views; no business logic lives here. Routes obtain locale from the `:lang` URL parameter.

## Interface

- `HomeRoute()` — renders `<HomePage />` configuring the home marketing sections and injecting `ProductRail`.
- `ProductsRoute()` — renders the product catalog browsing view with category strip, filter sidebar/sheet, sorting toolbar, and product grid.
- `ProductDetailRoute()` — renders `<ProductDetailPage />` for the `/:lang/products/:slug` route.
- `SearchRoute()` — reads `?q=` search query, fetches products via `useProducts`, and renders the product search results grid.
- `CartRoute()` — renders the full shopping cart review view with `CartLineItem` rows, quantity steppers, item deletion with focus restoration, and currency subtotals.
- `DesignRoute()` — renders `<DesignPage />` design system gallery.

## Invariants

- `[home.tsx:locale]` Locale is parsed from `useParams()` or URL context; route modules do not accept locale via props.
- `[cart-route.tsx:focus]` Manages focus transfer to adjacent line item removal buttons when an item is removed.

## Side Effects

- `[search-route.tsx:useProducts]` Triggers TanStack Query product searches on search param changes.
- `[cart-route.tsx:useCartStore]` Reads and dispatches quantity updates and item removal in the Zustand cart store.

## Verification

- Run: `pnpm test`
