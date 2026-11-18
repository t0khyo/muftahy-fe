# cart/lib

## Overview

Pure selector and localization helper functions for cart data structures, multi-currency subtotal calculation, and bilingual string resolution.

## Interface

- `resolveLocalizedName(value: { en: string; ar: string } | string | undefined, lang: string): string` — extracts the localized name matching the active language code with English fallback.
- `getCurrencySubtotals(items: CartItem[], lang: string): CurrencySubtotal[]` — groups cart line items by currency and calculates total minor unit sums and formatted strings using `formatMoneyFromMinor`.
- `CurrencySubtotal` — `{ currency: SupportedCurrency; amountMinor: number; formatted: string }`.

## Invariants

- `[cart-selectors.ts:getCurrencySubtotals]` Subtotals group items strictly by currency token; no implicit currency conversion or exchange rate calculations are executed.
- `[cart-selectors.ts:resolveLocalizedName]` Gracefully handles string primitives, localized `{ en, ar }` objects, and undefined values without throwing.

## Side Effects

- None

## Verification

- Run: `pnpm test`
