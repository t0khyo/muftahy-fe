# @workspace/domain

## Overview

Shared domain layer: Zod validation schemas, inferred TypeScript types, and locale-aware `Intl` formatters. This package has no dependency on any other workspace package and is the foundational type source for `@workspace/api`, `@workspace/ui`, and both apps. All money amounts are stored and validated in minor units (integer). All formatters enforce Western digits (0-9) in both Arabic and English locales.

## Interface

- `@workspace/domain/schemas/product`
  - `Product`, `ProductCategory`, `ProductPlatform`, `ProductRegion`, `ProductCollection`, `ProductListFilter`, `MoneyValue`, `LocalizedString` — TypeScript types (Zod-inferred)
  - `productSchema`, `productCollectionSchema`, `productListFilterSchema`, `moneySchema`, `localizedStringSchema`, etc. — runtime Zod validators
- `@workspace/domain/formatters/money`
  - `formatMoney`, `formatMoneyFromMinor`, `SUPPORTED_CURRENCIES`, `CURRENCY_DECIMALS`, `SupportedCurrency`, `Money`
- `@workspace/domain/formatters/number`
  - `formatNumber`, `FormatNumberOptions`
- `@workspace/domain/formatters/date`
  - `formatDate`, `FormatDateOptions`
- `@workspace/domain/formatters/locale`
  - `normalizeLocaleWithWesternDigits`

## Invariants

- No cross-workspace imports — this package imports only from `zod` and the standard library.
- All money amounts validated as non-negative integers (minor units).
- Western digits enforced in all formatted output, including Arabic locale.

## Side Effects

- No side effects. All exports are pure functions and static values.

## Verification

- Run: `pnpm test`
