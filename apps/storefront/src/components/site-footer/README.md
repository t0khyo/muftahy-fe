# site-footer

## Overview

Global site footer rendered by `RootLayout` at the bottom of every page. Displays the brand logo mark, copyright notice (dynamic year), and inline controls for theme switching (`ThemeSwitcher`) and language switching (`LanguageSwitcher`).

## Interface

- `SiteFooter(props: SiteFooterProps)` — the footer landmark element. `className?: string` for additional container classes.
- `ThemeSwitcher(props: ThemeSwitcherProps)` — three-button segmented control (Light / Dark / System) that reads and writes `useTheme()` context.
- `LanguageSwitcher(props: LanguageSwitcherProps)` — ghost button that navigates to the equivalent URL in the opposite locale (`en` ↔ `ar`) while preserving the current path, search params, and hash.

## Invariants

- Copyright year is computed at render time from `new Date().getFullYear()` — no hardcoded year.
- `LanguageSwitcher` preserves the full URL (path + search + hash) when switching locale.
- All i18n strings come from the `'footer'` and `'common'` namespaces — no hardcoded strings.
- `ThemeSwitcher` applies `aria-pressed` to the active option for accessible state communication.

## Side Effects

- `LanguageSwitcher`: calls React Router `navigate()` to change locale — triggers a full route re-render.
- `ThemeSwitcher`: calls `setTheme()` from `ThemeContext`, which writes to `localStorage` and toggles the `dark`/`light` class on `<html>`.

## Verification

- Run: `pnpm test`
