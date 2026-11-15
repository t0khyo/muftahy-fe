# admin

## Overview

`apps/admin` is the Muftahy back-office dashboard — a React + TypeScript + Vite application that will expose product, order, inventory, and user-management interfaces for operators of the Muftahy digital-key marketplace. It is a sibling of `apps/storefront` in the pnpm monorepo and consumes the shared `packages/ui`, `packages/i18n`, `packages/domain`, and `packages/api` workspace packages.

> [!NOTE]
> **Early-stage scaffold.** Only the Vite entry point (`main.tsx`) and a placeholder root component (`App.tsx`) contain source code. All planned feature directories (`app/`, `features/`, `routes/`) are empty. The interface, invariants, and side-effects sections below reflect the current implemented surface, not the full planned scope.

## Interface

| Symbol | File | Description |
|---|---|---|
| `App` (named + default export) | `src/App.tsx` | Root React component; renders a centred placeholder heading. |
| _(Vite entry)_ | `src/main.tsx` | Mounts `<App />` into `#root` inside `React.StrictMode`. |

**Planned (not yet implemented):**
- Route tree under `src/routes/` (React Router v7)
- Feature modules under `src/features/` — `products`, `orders`, `inventory`, `users`
- Provider composition and router setup under `src/app/`

## Invariants

- The DOM element with `id="root"` must be present in `index.html` before `main.tsx` executes; a missing element causes a non-null assertion throw.
- `@workspace/ui/globals.css` is imported in `main.tsx` and must be resolved at build time for the design-system tokens to be available.
- All UI must use semantic Tailwind tokens (`bg-background`, `text-foreground`, etc.) — no raw hex values or arbitrary Tailwind classes.
- Both Arabic (RTL) and English (LTR) locales are first-class citizens; logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) must be used throughout.
- The app does **not** call a real backend; all data flows through the typed mock service layer in `packages/api`.

## Side Effects

- **DOM mutation:** `createRoot(...).render(...)` in `main.tsx` replaces the content of `#root` on load.
- **CSS injection:** importing `@workspace/ui/globals.css` injects global design-system styles and CSS custom properties into the document.
- No network calls, localStorage reads, or analytics are made in the current scaffold state.

## Verification

```bash
# From the monorepo root
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

```bash
# Run only the admin app in dev mode
pnpm --filter admin dev
```
