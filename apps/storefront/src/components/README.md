# components

## Overview

App-wide shared UI components that appear on every page of the storefront. These are not feature-specific and are consumed directly by `RootLayout` and `app/`. Components here have no business logic; they orchestrate sub-components, read global context (theme, cart, i18n), and wire up navigation.

## Subdirectories & Boundaries

- **site-header**: [`./site-header/README.md`](./site-header/README.md) — Apple.com-style sticky navigation bar with search, cart, and mobile menu.
- **site-footer**: [`./site-footer/README.md`](./site-footer/README.md) — Global footer with theme switcher and language switcher.

## Interface

- `BrandLogoMark(props: BrandLogoMarkProps)` — SVG brand logo mark (the hexagonal key emblem) with theme-aware gradient stops (`dark:` Tailwind JIT classes). Accepts `className` for sizing and `idPrefix` to avoid duplicate SVG gradient IDs when used in multiple places on the same page.
- `LanguageSwitcher()` — shared language toggle button (used in both header context and as a standalone widget).
- `ThemeToggle()` — single cycling button (System → Light → Dark → System) with sun/moon icon and a pip indicator when in system mode.

## Invariants

- `BrandLogoMark` requires a unique `idPrefix` per usage site to prevent SVG `linearGradient` ID collisions (header, footer, and other uses must each pass a distinct prefix).
- `LanguageSwitcher` preserves the full URL path, search, and hash when switching locale.

## Side Effects

- `LanguageSwitcher`: calls React Router `navigate()`.
- `ThemeToggle`: calls `setTheme()` from `ThemeContext`, writing to `localStorage` and toggling `<html>` class.

## Verification

- Run: `pnpm test`
