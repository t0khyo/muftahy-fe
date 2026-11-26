# admin/src

## Overview

This directory is the source root of the `apps/admin` Vite application. It contains the React entry point and root component, plus empty placeholder directories reserved for future feature development. The structure mirrors `apps/storefront/src` by convention.

> [!NOTE]
> **Scaffold Status:** Only the Vite entry point (`main.tsx`) and the root component (`App.tsx`) currently contain source code. Planned feature directories (`app/`, `features/`, `routes/`, `lib/`, `components/`) are currently unpopulated placeholders.

### Directory Structure & Status

| Path | Status | Purpose |
|---|---|---|
| `main.tsx` | Implemented | Vite entry point — mounts `<App />` into `#root` under `React.StrictMode` |
| `App.tsx` | Implemented | Root React component and router provider |
| `app/` | Implemented | Providers, router setup, root layout (`root-layout.tsx`), `query-client.ts`, `query-meta.d.ts`, `rate-limit-context.tsx` |
| `features/` | Implemented | Feature modules (`auth`, `audit`, `categories`, `dashboard`, `inventory`, `ledger`, `orders`, `products`, `profile`, `promos`, `tickets`) |
| `routes/` | Implemented | Thin React Router v7 route modules (`admin-*-route.tsx`) wiring query error recovery and feature surfaces |
| `components/` | Implemented | App-wide UI components including `components/feedback/` (`AdminQueryError`, `FormErrorAlert`, `RateLimitBanner`) |
| `hooks/` | Implemented | Shared hooks including `use-admin-mutation.ts` and `use-rate-limit-cooldown.ts` |
| `lib/` | Implemented | App-only utilities including `api-feedback.ts` (API error resolution and toast deduplication) |
| `assets/` | Static Assets | Image assets — non-code resources |

## Interface

- `[App.tsx:App]`: Root React component function rendering the admin layout shell and placeholder header.
- `[App.tsx:default]`: Default export pointing to `App`.
- `[main.tsx:createRoot]`: Application bootstrap sequence mounting the React application tree into the `#root` container.

### Future Architecture Contracts
- Feature modules under `features/` will each contain components, hooks, services, and tests.
- Routes under `routes/` must remain thin without embedded business logic.
- Provider and router composition resides in `app/`.

## Invariants

- `[main.tsx:createRoot]`: The container element `#root` must exist in `index.html` at runtime; the non-null assertion `document.getElementById('root')!` will throw if absent.
- `[main.tsx:import '@workspace/ui/globals.css']`: Workspace design-system CSS must be resolved at build time for semantic theme tokens to apply.
- Dependency direction: Code in `apps/admin/src` may import from `packages/*`, but packages must never import from `apps/*`.
- UI conventions: All styling must strictly utilize semantic design tokens and logical directional properties (`ms-*`, `me-*`, `ps-*`, `pe-*`).

## Side Effects

- `[main.tsx:createRoot]`: Modifies the browser DOM by mounting the React component hierarchy into the `#root` element.
- `[main.tsx:import '@workspace/ui/globals.css']`: Injects global design-system CSS rules and custom properties into the browser document.

## Verification

- Run: `pnpm test`
- Run: `pnpm typecheck`
- Run: `pnpm lint`
- Run: `pnpm build`
