# admin

## Overview

`apps/admin` is the Muftahy back-office dashboard — a React + TypeScript + Vite application that exposes product, order, inventory, and user-management interfaces for operators of the Muftahy digital-key marketplace. It is a sibling of `apps/storefront` in the pnpm monorepo and consumes the shared `packages/ui`, `packages/i18n`, `packages/domain`, and `packages/api` workspace packages.

> [!NOTE]
> **Early-stage scaffold.** Only the Vite entry point (`src/main.tsx`) and placeholder root component (`src/App.tsx`) currently contain active source code. Planned feature directories (`src/app/`, `src/features/`, `src/routes/`) are reserved empty placeholders. The contracts below reflect the implemented codebase surface.

## Interface

- [src](./src/README.md): Application source root housing the React entry point, root component, and future feature modules.
- `[vite.config.ts:default]`: Vite build configuration integrating `@vitejs/plugin-react` and `@tailwindcss/vite`.
- `[eslint.config.js:default]`: ESLint configuration extending workspace rules with React hooks and refresh plugins.
- `[package.json:scripts]`: Package execution commands for `dev`, `build`, `lint`, `typecheck`, and `preview`.

### Planned Interfaces
- Route tree under `src/routes/` (React Router v7).
- Feature modules under `src/features/` (`products`, `orders`, `inventory`, `users`).
- Provider composition and router setup under `src/app/`.

## Invariants

- `[index.html:div#root]` / `[src/main.tsx:createRoot]`: The DOM element with `id="root"` must exist in `index.html` prior to `src/main.tsx` execution; missing element causes runtime assertion failure.
- `[src/main.tsx:import '@workspace/ui/globals.css']`: `@workspace/ui/globals.css` must resolve at build time to provide design system variables and tokens.
- UI styling conventions: UI components must strictly consume semantic design tokens (`bg-background`, `text-foreground`) and logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`).
- Service architecture: No direct backend calls; all data operations must route through the typed service layer in `packages/api`.
- Dependency direction: Imports may flow from `packages/*` into `apps/admin`, never in reverse.

## Side Effects

- `[index.html:script]`: Checks `localStorage` for `muftahy-theme` or queries `matchMedia('(prefers-color-scheme: dark)')` to mutate `document.documentElement` class list (`dark` or `light`).
- `[src/main.tsx:createRoot]`: Mounts React application into `#root` DOM container on load.
- `[src/main.tsx:import '@workspace/ui/globals.css']`: Injects global design-system CSS rules and custom properties into document.

## Verification

- Run: `pnpm --filter admin dev`
- Run: `pnpm --filter admin build`
- Run: `pnpm --filter admin lint`
- Run: `pnpm --filter admin typecheck`
- Monorepo run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build`
