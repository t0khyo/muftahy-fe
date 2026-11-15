# admin/src — Source Blueprint

## Overview

This directory is the source root of the `apps/admin` Vite application. It contains the React entry point and root component, plus empty placeholder directories reserved for future feature development. The structure mirrors `apps/storefront/src` by convention.

## Directory Map

| Path | Status | Purpose |
|---|---|---|
| `main.tsx` | ✅ Implemented | Vite entry — mounts `<App />` into `#root` under `React.StrictMode` |
| `App.tsx` | ✅ Implemented (scaffold) | Root component — centred "Muftahy Admin" placeholder heading |
| `app/` | 🔲 Empty | Intended for providers, router setup, and root layout composition |
| `features/` | 🔲 Empty | Intended for `products/`, `orders/`, `inventory/`, `users/` feature modules |
| `routes/` | 🔲 Empty | Intended for thin React Router v7 route modules |
| `assets/` | 🖼 Images only | Static image assets (`hero.png`, `react.svg`, `vite.svg`) — no source code |

## Architectural Notes

- Each future feature module under `features/` should be self-contained: its own components, hooks, services (backed by `packages/api` mock adapters), and Vitest tests.
- Route modules under `routes/` must remain thin — no business logic.
- Provider and router composition belongs in `app/`, not in `main.tsx`.
- Dependency direction: this app imports from `packages/*`; the reverse is never permitted.

## Verification

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```
