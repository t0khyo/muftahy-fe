# Formatters

## Overview

Locale-aware formatting utilities for money, numbers, and dates. All formatters delegate to the browser/Node `Intl` API and enforce Western digits (0-9) even when the active locale is Arabic, by injecting the Unicode extension `-u-nu-latn` via `locale.ts`. Currency amounts must be passed in minor units or as pre-divided major units; formatters never perform money arithmetic.

## Interface

- `locale.ts`
  - `normalizeLocaleWithWesternDigits(locale?: string): string` — appends `-u-nu-latn` to Arabic locale tags that lack a numeral system extension
- `money.ts`
  - `SUPPORTED_CURRENCIES` — `readonly` tuple of supported ISO 4217 codes: `EGP`, `USD`, `SAR`, `AED`, `QAR`, `KWD`, `BHD`, `OMR`
  - `CURRENCY_DECIMALS: Record<SupportedCurrency, number>` — minor-unit exponent per currency (2 for most, 3 for KWD/BHD/OMR)
  - `SupportedCurrency` — union type derived from `SUPPORTED_CURRENCIES`
  - `Money` — interface `{ amountMinor: number; currency: SupportedCurrency }`
  - `FormatMoneyOptions` — interface `{ currency, locale?, currencyDisplay? }`
  - `formatMoney(amount: number, options: FormatMoneyOptions): string` — formats a **major-unit** amount
  - `formatMoneyFromMinor(amountMinor: number, currency: SupportedCurrency, locale?: string): string` — converts minor to major then formats
- `number.ts`
  - `FormatNumberOptions` — extends `Intl.NumberFormatOptions` with optional `locale`
  - `formatNumber(value: number, options?: FormatNumberOptions): string`
- `date.ts`
  - `FormatDateOptions` — extends `Intl.DateTimeFormatOptions` with optional `locale`
  - `formatDate(value: Date | number | string, options?: FormatDateOptions): string`

## Invariants

- Western digits (0-9) are always used, even for `ar` locale — enforced by `normalizeLocaleWithWesternDigits`.
- `formatMoneyFromMinor` performs division by `10^decimals`; callers must not pass already-divided amounts to this function.
- `formatMoney` accepts major-unit amounts only.
- Supported currencies are fixed at build time via the `SUPPORTED_CURRENCIES` constant; adding a currency requires updating both the tuple and `CURRENCY_DECIMALS`.

## Side Effects

- No network calls, no disk access. `Intl` APIs may read the host's ICU locale data.

## Verification

- Run: `pnpm test`
