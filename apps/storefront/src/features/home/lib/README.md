# home/lib

## Overview

Utility helpers for home page navigation, routing normalization, and localization resolution.

## Interface

- `resolveLocaleHref(href: string, lang: string): string` — resolves and normalizes navigation targets for the current language context, handling parameterized `:lang` paths, absolute external URLs, hashes, and relative paths.

## Invariants

- `[resolve-locale-href.ts:empty-and-protocols]` Returns empty strings, in-page hash links (`#...`), and non-HTTP protocol schemes (`mailto:`, `tel:`) unchanged.
- `[resolve-locale-href.ts:external]` Returns absolute external URLs (`http://`, `https://`) unchanged.
- `[resolve-locale-href.ts:token-replacement]` Replaces parameterized `/:lang/` tokens with the target language code.
- `[resolve-locale-href.ts:idempotent-prefix]` Prevents duplicate locale prefixing when paths already begin with `/${lang}`.
- `[resolve-locale-href.ts:relative-prefix]` Ensures all relative paths begin with `/${lang}/`.

## Side Effects

- None

## Verification

- Run: `pnpm test`
