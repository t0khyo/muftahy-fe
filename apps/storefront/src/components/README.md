# components

## Overview

App-wide shared UI components that appear across the storefront layout. These components orchestrate layout structure, read global contexts (theme, cart, i18n), and wire up routing.

## Interface

### Components
- `BrandLogoMark(props: BrandLogoMarkProps)` — SVG brand emblem with theme-aware gradient fills. Requires unique `idPrefix` per usage site to prevent SVG ID collisions.
- `Breadcrumbs(props: BreadcrumbsProps)` — accessible navigation breadcrumbs with schema-aware landmark wrapping and separator icons.
- `BreadcrumbItem` — `{ label: string; href?: string }`.
- `LanguageSwitcher(props?: LanguageSwitcherProps)` — standalone language toggle button swapping `/en` and `/ar` prefixes while preserving path and query.
- `PaymentMethodLogo(props: PaymentMethodLogoProps)` — displays full-color Vodafone Cash or InstaPay logos directly (without a visual container box) with localized accessible labels.
- `ThemeToggle(props?: ThemeToggleProps)` — cycling theme toggle button (System → Light → Dark) with sun/moon indicators.

### Subdirectories
- **site-footer**: [`./site-footer/README.md`](./site-footer/README.md) — Global footer landmark, theme switcher, and copyright strip.
- **site-header**: [`./site-header/README.md`](./site-header/README.md) — Apple.com-style sticky navigation bar with search sheet, cart dropdown, and mobile menu.

## Invariants

- `[brand-logo.tsx:idPrefix]` `BrandLogoMark` requires an explicit, distinct `idPrefix` per instance on the page to prevent duplicate SVG `linearGradient` ID conflicts.
- `[breadcrumbs.tsx:items]` Renders trailing item as current page (`aria-current="page"`) without an active anchor link.
- `[language-switcher.tsx:url]` Preserves URL path, search params, and hash when switching between English and Arabic.

## Side Effects

- `[language-switcher.tsx:navigate]` Triggers navigation via React Router `navigate()`.
- `[theme-toggle.tsx:setTheme]` Invokes `setTheme()` writing to `localStorage` and updating the `<html>` root class.

## Verification

- Run: `pnpm test`
