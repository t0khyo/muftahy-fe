# Muftahy Storefront — src Blueprint

## System Overview

React + TypeScript single-page application for the Muftahy digital marketplace storefront. Vite-bundled, RTL/LTR bilingual (Arabic + English), dark/light themed. The entry point (`main.tsx`) mounts `<App>` which wraps a `BrowserRouter` in `AppProviders` (theme + i18n + query client). All routes are under `/:lang/...` and are rendered inside `RootLayout` which provides the sticky `SiteHeader` and `SiteFooter` on every page.

## Local Interface & Invariants

- `App()` — root application component providing `AppProviders` and `RouterProvider`.
- `[main.tsx]` — application entry point rendering `<App />` into DOM `#root` within React `StrictMode` and registering global window error handlers.

## Subdirectories & System Boundaries

- **app**: [`./app/README.md`](./app/README.md) — Application bootstrap: `AppProviders`, `router`, `RootLayout`, `ThemeProvider`, `I18nProvider`, `QueryProvider`, and `queryClient`.
- **components**: [`./components/README.md`](./components/README.md) — App-wide shared components: `SiteHeader`, `SiteFooter`, `BrandLogoMark`, `LanguageSwitcher`, `ThemeToggle`, `Breadcrumbs`.
- **features**: [`./features/README.md`](./features/README.md) — Feature domains: `cart`, `design`, `home`, and `products`.
- **routes**: [`./routes/README.md`](./routes/README.md) — Route entry points: `HomeRoute`, `ProductsRoute`, `ProductDetailRoute`, `SearchRoute`, `CartRoute`, `DesignRoute`.

## Global Invariants

- All routes are scoped under `/:lang` prefix; invalid or missing locale redirects to `/en/products`. Locale is URL-authoritative — it is never stored in React state or `localStorage`.
- `document.documentElement.lang` and `.dir` are set exclusively by `RootLayout` based on the `:lang` URL param.
- Dependency direction: `routes → features → packages/*`. Features never import from other features. `packages/ui` imports from no other workspace package.
- All monetary amounts are stored in minor units (integers); formatting goes through `@workspace/domain/formatters/money`. No floating-point arithmetic for money.
- Western digits (0–9) are used in both Arabic and English locales; `Intl.NumberFormat` is called with `ar-u-nu-latn` for Arabic.
- All user-facing strings go through `react-i18next`. No hardcoded strings in components.
- Logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) are used for all directional spacing. Physical direction utilities (`ml-*`, `mr-*`) are banned.
- Semantic design tokens only (`bg-background`, `text-foreground`, etc.). No raw hex or arbitrary Tailwind values.

## Global Side Effects

- `ThemeProvider`: reads/writes `localStorage` key `'muftahy-theme'`; writes `dark`/`light` class to `<html>`.
- `RootLayout`: writes `lang` and `dir` attributes on `<html>`.
- `SiteHeader` (`MobileMenu`, `SearchPanel`): writes/removes `data-header-locked` attribute on `<body>` to suppress scroll while panels are open.
- `QueryClient`: maintains an in-memory cache of server state with 5-minute stale time.
- `useCartStore`: in-memory Zustand store; no persistence.

## System Verification

- Run: `pnpm test`
