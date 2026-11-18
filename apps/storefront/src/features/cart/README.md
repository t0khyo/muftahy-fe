# features/cart

## Overview

The shopping cart feature module. Manages in-memory shopping cart state, line item rendering, quantity adjustments, and multi-currency subtotal derivation. Consumed by `CartButton` in the global header and `CartRoute`.

## Subdirectories & Boundaries

- **components**: [`./components/README.md`](./components/README.md) — `CartLineItem` row component with quantity stepper and removal actions.
- **lib**: [`./lib/README.md`](./lib/README.md) — `resolveLocalizedName` and `getCurrencySubtotals` multi-currency derivation helpers.
- **stores**: [`./stores/README.md`](./stores/README.md) — `useCartStore` Zustand store managing reactive items and count state.

## Verification

- Run: `pnpm test`
