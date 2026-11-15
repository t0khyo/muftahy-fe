# Muftahy Blueprint

## System Overview

Muftahy is a digital marketplace for digital keys, game codes, software licenses, and subscriptions targeting customers in the Middle East and GCC. The repository is structured as a pnpm monorepo with strict package boundaries, full bilingual support (Arabic RTL and English LTR), dark/light theming, and a mock-first service architecture designed for seamless future backend integration.

## Subdirectories & System Boundaries

- **apps**: [`./apps/README.md`](./apps/README.md) — User-facing storefront and back-office admin applications.
- **packages**: [`./packages/README.md`](./packages/README.md) — Shared workspace libraries including service layer (`api`), domain logic and schemas (`domain`), localization resources (`i18n`), UI components (`ui`), and shared tooling (`config`).

## Global Invariants

- **Unidirectional Architecture**: Apps import from packages; packages never import from apps. Apps never import from each other. Only `@workspace/api` may import from `@workspace/domain`; `@workspace/ui`, `@workspace/i18n`, `@workspace/domain`, and `@workspace/config` are leaves with no cross-workspace imports.
- **Bilingual & RTL First-Class**: Arabic and English are equal citizens. Locale is URL-authoritative (`/:lang/...`). All directional styling must use logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`).
- **Western Digits Everywhere**: Western digits (0-9) are used in both Arabic and English; `Intl` formatters enforce `-u-nu-latn` for Arabic.
- **Financial Precision**: Money amounts are strictly stored as integer minor units (`priceMinor`). Floating-point arithmetic for currency is strictly prohibited.
- **Design Tokens**: UI components exclusively use semantic design tokens (`bg-background`, `text-foreground`, etc.). Arbitrary hex values or raw pixel utilities are disallowed.
- **Service Layer Seam**: Components and hooks never call `fetch` directly or import mock data directly; all data access flows through TanStack Query and `@workspace/api` services.
- **Security for Digital Goods**: All mock keys and licenses are obviously fake (`XXXXX-XXXXX-XXXXX`). Purchased keys are revealed via an explicit reveal-and-copy UI pattern.

## Global Side Effects

- Client-side `localStorage` usage for theme preference (`muftahy-theme`).
- Runtime `<html>` attribute modification (`lang` and `dir`) driven by route locale.
- Portaled dialogs and sheets rendered into `document.body` by Base UI primitives.
- Global CSS custom properties injected via `@workspace/ui/globals.css`.

## System Verification

- Run: `pnpm test`
