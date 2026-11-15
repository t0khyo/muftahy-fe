# app

## Overview

Application bootstrap: provider composition, router definition, root layout, and theme/i18n infrastructure. This directory owns the app-level concerns that wrap the entire React tree; nothing in `features/` or `components/` imports from here except through React context.

## Interface

- `AppProviders(props: AppProvidersProps)` — composes `ThemeProvider > I18nProvider > QueryProvider` in that order. The single mount point for all global context.
- `router` — `BrowserRouter` instance created via `createBrowserRouter`. Route table:
  - `/` → redirect to `/en`
  - `/:lang` → `RootLayout` with children: `HomeRoute`, `ProductsRoute` (`products`), `SearchRoute` (`search`), `CartRoute` (`cart`), `DesignRoute` (`design`), catch-all → redirect to `products`.
  - `*` → redirect to `/en/products`.
- `RootLayout()` — validates `:lang` param against `isSupportedLanguage()`; redirects invalid locales to `/en/products`. Sets `document.documentElement.lang` and `.dir` on locale change. Renders `SiteHeader`, `<main>`, `<Outlet>`, and `SiteFooter`.
- `ThemeProvider(props: ThemeProviderProps)` — reads/writes theme preference from `localStorage` (key: `'muftahy-theme'`). Applies `'dark'` or `'light'` class to `document.documentElement`. Respects `prefers-color-scheme` media query when theme is `'system'`.
- `I18nProvider(props: I18nProviderProps)` — wraps `I18nextProvider` using the shared `i18n` instance from `@workspace/i18n/config`.
- `QueryProvider(props: QueryProviderProps)` — wraps `QueryClientProvider` with the shared `queryClient`. Accepts an optional `client` prop for test injection.
- `queryClient: QueryClient` — singleton with `staleTime: 5 min`, `refetchOnWindowFocus: false`, `retry: 1`.
- `Theme` — `'dark' | 'light' | 'system'`
- `ThemeProviderState` — `{ theme, resolvedTheme, setTheme }`
- `ThemeContext` — React context for theme state.
- `useTheme(): ThemeProviderState` — hook; throws if used outside `ThemeProvider`.

## Invariants

- Provider nesting order is fixed: `ThemeProvider` must be outermost so theme class is set on `<html>` before any component renders.
- `RootLayout` is the only place that writes `document.documentElement.lang` and `document.documentElement.dir`; locale is always derived from the URL `:lang` param, never from global state.
- `ThemeProvider` falls back to `defaultTheme` if `localStorage` is unavailable or throws.
- `useTheme` must be used within `ThemeProvider` or it throws.

## Side Effects

- `ThemeProvider`: reads/writes `localStorage` key `'muftahy-theme'`; toggles `dark`/`light` class on `<html>`; listens to `prefers-color-scheme` media query.
- `RootLayout`: writes `document.documentElement.lang` and `.dir` on locale change.
- `QueryProvider`: instantiates the global `QueryClient` cache.

## Verification

- Run: `pnpm test`
