# app

## Overview

Application bootstrap: provider composition, router definition, root layout, and theme/i18n infrastructure. This directory owns the top-level application concerns that wrap the React component tree; feature modules and components consume these capabilities via React context.

## Interface

- `AppProviders(props: AppProvidersProps)` — composes `ThemeProvider > I18nProvider > QueryProvider` in that strict order. Single mount point for application context.
- `router` — `BrowserRouter` instance created via `createBrowserRouter`. Route hierarchy:
  - `/` → redirect to `/en`
  - `/:lang` → `RootLayout` with children:
    - `/` (index) → `HomeRoute`
    - `products` → `ProductsRoute`
    - `products/:slug` → `ProductDetailRoute`
    - `search` → `SearchRoute`
    - `cart` → `CartRoute`
    - `design` → `DesignRoute`
    - `*` → `CatchAllRedirect`
  - `*` → redirect to `/en/products`
- `CatchAllRedirect()` — handles unmatched sub-routes under `/:lang/*`, redirecting to `/:lang/products`.
- `RootLayout()` — validates `:lang` route parameter against `isSupportedLanguage()`; redirects unsupported locales to `/en/products`. Synchronizes `document.documentElement.lang` and `.dir` on locale changes. Renders `SiteHeader`, main landmark, `<Outlet />`, and `SiteFooter`.
- `ThemeProvider(props: ThemeProviderProps)` — reads and writes theme preferences to `localStorage` (`muftahy-theme`). Synchronizes `dark`/`light` classes on `document.documentElement`.
- `I18nProvider(props: I18nProviderProps)` — initializes `react-i18next` with shared config.
- `QueryProvider(props: QueryProviderProps)` — wraps child tree in TanStack `QueryClientProvider` with `queryClient`.
- `queryClient: QueryClient` — shared query cache singleton (5-minute stale time, 1 retry).
- `Theme` — `'dark' | 'light' | 'system'`.
- `ThemeProviderState` — `{ theme, resolvedTheme, setTheme }`.
- `useTheme(): ThemeProviderState` — hook returning active theme state.

## Invariants

- `[providers.tsx:AppProviders]` Nesting order is immutable: `ThemeProvider` must wrap `I18nProvider` and `QueryProvider` to ensure HTML theme classes exist before DOM rendering.
- `[root-layout.tsx:RootLayout]` `RootLayout` is the sole writer of `document.documentElement.lang` and `.dir`.
- `[theme-provider.tsx:ThemeProvider]` Gracefully falls back to default theme if `localStorage` access is blocked.
- `[theme-context.ts:useTheme]` Throws descriptive error if invoked outside `ThemeProvider`.

## Side Effects

- `[theme-provider.tsx:localStorage]` Reads/writes `localStorage` key `'muftahy-theme'`; toggles `dark`/`light` classes on `<html>`.
- `[root-layout.tsx:document.documentElement]` Sets `lang` and `dir` attributes on the root HTML node.
- `[query-client.ts:QueryClient]` Instantiates and manages in-memory HTTP cache.

## Verification

- Run: `pnpm test`
