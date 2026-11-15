# features/cart

## Overview

The cart feature manages client-side shopping cart state using Zustand. It provides the global cart store consumed by `CartButton` (in the site header) and `CartRoute`.

## Subdirectories & Boundaries

- **stores**: [`./stores/README.md`](./stores/README.md) — `useCartStore` Zustand store with `CartItem` and `CartState` types.

## Verification

- Run: `pnpm test`
