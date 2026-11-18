# cart/stores

## Overview

Zustand store for client-side cart state. This is the only global state store in the storefront application. It tracks cart line items, total item quantity, and exposes mutations for adding, updating, removing, and clearing items.

## Interface

- `useCartStore` — Zustand store hook providing reactive selector access to `CartState`.
- `CartState` — `{ items: CartItem[]; count: number; addItem; updateQuantity; removeItem; clear }`.
- `CartItem` — `{ id, productId, planId, slug, name, planName?, priceMinor, currency, quantity }`.
- `CartInputItem` — `{ id?, productId?, planId?, slug?, name, planName?, priceMinor, currency? }`.
- `addItem(item: CartInputItem, quantity?: number): void` — adds an item to the cart; if the item ID already exists, the operation is idempotent and does not increase quantity.
- `updateQuantity(id: string, quantity: number, maxStock?: number): void` — updates item quantity clamped to at least 1, respecting `maxStock` ceiling when provided.
- `removeItem(id: string): void` — removes an item by ID.
- `clear(): void` — resets items to empty array and count to 0.

## Invariants

- `[cart-store.ts:count]` `count` always reflects the exact sum of `quantity` across all items in `items`.
- `[cart-store.ts:addItem]` Adding an existing item is strictly idempotent.
- `[cart-store.ts:updateQuantity]` Quantity is clamped to `Math.max(1, quantity)` and cannot exceed `maxStock` when positive stock is enforced.
- `[cart-store.ts:priceMinor]` Monetary amounts are stored as integer minor units (`priceMinor`); floating-point money calculations are forbidden.
- `[cart-store.ts:storage]` State is held strictly in memory without `localStorage` synchronization.

## Side Effects

- `[cart-store.ts:set]` Triggers reactive re-renders for subscribed React components.
- None (no network calls, no disk operations).

## Verification

- Run: `pnpm test`
