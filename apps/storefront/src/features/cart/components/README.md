# cart/components

## Overview

UI presentation components for cart line items, quantity controls, and stock warnings.

## Interface

- `CartLineItem(props: CartLineItemProps)` — renders an individual cart row including product thumbnail, plan badge, localized titles, unit price, quantity increment/decrement stepper, total price, and removal button with focus management hooks.
- `CartLineItemProps` — `{ item: CartItem; lang: string; onUpdateQuantity; onRemove; removeButtonRef? }`.

## Invariants

- `[cart-line-item.tsx:stock]` Validates live stock status against fetched product plan data; flags out-of-stock items and prevents exceeding available quantity.
- `[cart-line-item.tsx:formatMoneyFromMinor]` Multiplies unit `priceMinor` by `quantity` and formats via shared domain money formatter with Western digits.

## Side Effects

- `[cart-line-item.tsx:useProduct]` Triggers TanStack Query fetch for product details by slug.
- `[cart-line-item.tsx:onUpdateQuantity]` Invokes quantity change callback to update the Zustand store.
- `[cart-line-item.tsx:onRemove]` Invokes item deletion callback.

## Verification

- Run: `pnpm test`
