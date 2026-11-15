# cart/stores

## Overview

Zustand store for client-side cart state. This is the only global store in the storefront. It tracks cart items, total item count, and exposes mutations for adding, removing, and clearing items.

## Interface

- `useCartStore` — Zustand store hook; selector-based access to `CartState`.
- `CartState` — `{ items: CartItem[]; count: number; addItem; removeItem; setCount; clear }`.
- `CartItem` — `{ id: string; name: string; priceMinor: number; quantity: number }`.
- `addItem(item: Omit<CartItem, 'quantity'>, quantity?: number): void` — upserts an item (increments quantity if already present).
- `removeItem(id: string): void` — removes an item by id.
- `setCount(count: number): void` — overrides count directly (clamped to ≥ 0).
- `clear(): void` — empties the cart.

## Invariants

- `count` always equals the sum of `quantity` across all `items`; it is derived and kept in sync on every `addItem` and `removeItem` call.
- `setCount` never sets count below 0.
- Prices are stored as `priceMinor` (integer minor currency units, e.g. cents). No floating-point arithmetic is performed in the store.
- Cart state is in-memory only; it is not persisted to `localStorage`.

## Side Effects

- Mutations update React component trees subscribed to `useCartStore` via Zustand's reactive subscriptions.
- No network calls, no disk access.

## Verification

- Run: `pnpm test`
