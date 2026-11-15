# Locales

## Overview

JSON translation files for Arabic (`ar.json`) and English (`en.json`). Both files must be kept in sync — every key present in one locale must exist in the other. Namespaces mirror the application's feature areas: `common`, `nav`, `header`, `footer`, `search`, `cart`, `products`, `design`, and `home`.

## Interface

- `ar.json` — Arabic translations (RTL, all keys present)
- `en.json` — English translations (LTR, authoritative key structure; used as the TypeScript type source in `types.ts`)

## Invariants

- All keys in `en.json` must have corresponding keys in `ar.json` and vice versa.
- No hardcoded strings outside these files may appear in components.
- Interpolation placeholders (e.g., `{{query}}`, `{{count}}`) must be identical across both locale files for the same key.

## Side Effects

- Statically imported by `config.ts` at module load time; no runtime network requests.

## Verification

- Run: `pnpm test`
