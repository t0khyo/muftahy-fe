# site-footer

## Overview

Global site footer rendered by `RootLayout` at the bottom of every page. Displays the brand logo mark, copyright notice (dynamic year), and inline controls for theme switching (`ThemeSwitcher`) and language switching (`LanguageSwitcher`).

## Interface

- `SiteFooter(props: SiteFooterProps)` — the footer landmark element with links grid and localized bottom strip. `className?: string` for additional container styling.
- `ThemeSwitcher(props: ThemeSwitcherProps)` — three-button segmented control (Light / Dark / System) that reads and writes `useTheme()` context.
- `LanguageSwitcher(props: LanguageSwitcherProps)` — ghost button that navigates to the equivalent URL in the opposite locale (`en` ↔ `ar`) while preserving the current path, search params, and hash.

## Invariants

- `[site-footer.tsx:getFullYear]` Copyright year is computed dynamically at render time from `new Date().getFullYear()` — no hardcoded static year.
- `[language-switcher.tsx:preserveUrl]` `LanguageSwitcher` preserves the full URL (pathname + search query + hash) when toggling language locale.
- `[site-footer.tsx:i18n]` All strings originate from the `'footer'` and `'common'` namespaces.
- `[theme-switcher.tsx:aria-pressed]` Applies `aria-pressed` to the currently active theme button for accessible assistive state communication.

## Side Effects

- `[language-switcher.tsx:navigate]` Calls React Router `navigate()` to switch active language URL prefix.
- `[theme-switcher.tsx:setTheme]` Calls `setTheme()` from `ThemeContext`, writing to `localStorage` and toggling `dark`/`light` classes on `<html>`.

## Verification

- Run: `pnpm test`
