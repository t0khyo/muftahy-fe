# Formatters

## Overview

Locale-aware formatting utilities for money, numbers, and dates. All formatters delegate to the standard `Intl` API and enforce Western digits (0-9) even when the active locale is Arabic, by injecting the Unicode extension `-u-nu-latn` via `locale.ts`. Currency amounts are handled in minor units or pre-divided major units; formatters never perform money arithmetic.

## Interface

- `[locale.ts:normalizeLocaleWithWesternDigits]` `(locale?: string): string` — appends `-u-nu-latn` to Arabic locale tags that lack a numeral system extension
- `[money.ts:SUPPORTED_CURRENCIES]` `readonly ['EGP', 'USD', 'SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR']` — supported ISO 4217 currency list
- `[money.ts:SupportedCurrency]` `(typeof SUPPORTED_CURRENCIES)[number]` — union of supported currency codes
- `[money.ts:CURRENCY_DECIMALS]` `Record<SupportedCurrency, number>` — minor-unit exponent per currency (3 for KWD, BHD, OMR; 2 for all others)
- `[money.ts:Money]` `interface { amountMinor: number; currency: SupportedCurrency }` — money value structure
- `[money.ts:FormatMoneyOptions]` `interface { currency: SupportedCurrency; locale?: string; currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name' }`
- `[money.ts:formatMoney]` `(amount: number, options: FormatMoneyOptions): string` — formats a major-unit amount with localized currency symbol
- `[money.ts:formatMoneyFromMinor]` `(amountMinor: number, currency: SupportedCurrency, locale?: string): string` — converts minor units to major units and formats
- `[number.ts:FormatNumberOptions]` `interface FormatNumberOptions extends Intl.NumberFormatOptions { locale?: string }`
- `[number.ts:formatNumber]` `(value: number, options?: FormatNumberOptions): string` — formats numbers with Western digits
- `[date.ts:FormatDateOptions]` `interface FormatDateOptions extends Intl.DateTimeFormatOptions { locale?: string }`
- `[date.ts:formatDate]` `(value: Date | number | string, options?: FormatDateOptions): string` — formats dates with Western digits

## Invariants

- `[locale.ts:normalizeLocaleWithWesternDigits]` Enforces Western digits (0-9) by appending `-u-nu-latn` if `locale` starts with `ar` and lacks `-u-nu-`; defaults fallback locale to `'en'`.
- `[money.ts:CURRENCY_DECIMALS]` Maps decimals to 3 for KWD, BHD, OMR, and 2 for EGP, USD, SAR, AED, QAR.
- `[money.ts:formatMoneyFromMinor]` Calculates major units as `amountMinor / 10^(CURRENCY_DECIMALS[currency] ?? 2)` before delegating to `formatMoney`.
- `[money.ts:formatMoney]` Requires major-unit amounts; minimum and maximum fraction digits default to currency decimals.
- `[date.ts:formatDate]` Normalizes non-Date values via `new Date(value)` and delegates to `Intl.DateTimeFormat` with Western digits.

## Side Effects

- None. Formatting operations are pure and synchronous.

## Verification

- Run: `pnpm test`
