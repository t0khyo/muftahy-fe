# @workspace/domain

## Overview

Shared domain layer: Zod validation schemas, inferred TypeScript types, and locale-aware `Intl` formatters. This package has no dependency on any other workspace package and serves as the foundational type authority for `@workspace/api`, `@workspace/ui`, and applications. All money amounts are stored and validated in minor units (integers). All formatters enforce Western digits (0-9) in both Arabic and English locales.

## Interface

- src: [./src/README.md](./src/README.md) - Domain source tree grouping schemas and formatting utilities
- `@workspace/domain/schemas/*` — entity schemas and TypeScript types (`Product`, `ProductPlan`, `ProductCategory`, `ProductPlatform`, `ProductRegion`, `MoneyValue`, `LocalizedString`, etc.)
- `@workspace/domain/formatters/*` — `formatMoney`, `formatMoneyFromMinor`, `formatNumber`, `formatDate`, `normalizeLocaleWithWesternDigits`

## Invariants

- No cross-workspace imports — this package imports only from `zod` and the standard library.
- All money amounts are validated as non-negative integers representing minor currency units.
- Western digits (0-9) are enforced across all formatted output, including Arabic locales.

## Side Effects

- None. All exports are pure functions and static definitions.

## Verification

- Run: `pnpm test`
