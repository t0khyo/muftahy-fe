# Architecture

Muftahy is a digital marketplace (keys, game codes, licenses, subscriptions) for the Middle East and GCC. This document explains how the frontend is organized and why. Agents and humans should check structural changes against it.

Scope today: frontend only. There is no backend. The design keeps a single seam (`packages/api`) where a real backend plugs in later.

## 1. Goals

- Two apps (storefront, admin) that share UI, domain types, and i18n without coupling to each other.
- Arabic (RTL) and English (LTR) as equals.
- Mock-first development that can switch to a real API by changing one layer.
- Predictable structure so any feature can be found and changed without side effects.

## 2. Workspace map

| Path | Purpose | May import from |
| --- | --- | --- |
| `apps/storefront` | Customer-facing app | all packages |
| `apps/admin` | Admin dashboard | all packages |
| `packages/ui` | shadcn + Base UI components, no business logic | nothing in the workspace |
| `packages/i18n` | react-i18next setup, translations, typed keys | nothing in the workspace |
| `packages/domain` | Types, Zod schemas, money/number/date formatters | nothing in the workspace |
| `packages/api` | Service interfaces, mock adapters, factory | `domain` |
| `packages/config` | Shared tsconfig, eslint, tailwind base | nothing |

## 3. Dependency rules

```
apps/*  ──►  api ──► domain
   │
   ├──────►  ui
   ├──────►  i18n
   └──────►  domain
```

1. Apps import from packages. Packages never import from apps.
2. Apps never import from each other. Shared code moves to a package.
3. `ui`, `i18n`, and `domain` are leaves: they do not import other workspace packages.
4. `api` may import only `domain`.
5. No circular dependencies.

If a rule needs bending, write an ADR in `docs/decisions/` first.

## 4. Inside an app

```
src/
  app/          entry, providers (Query, i18n, theme), router setup, root layout
  routes/       one thin module per URL; wires a route to a feature component
  features/     one folder per business capability
  components/   app-wide pieces shared across features
  lib/          app-only helpers
```

### Features

A feature is a self-contained slice, for example `features/products`:

```
features/products/
  components/   product-card.tsx, product-grid.tsx, ...
  hooks/        use-products.ts (TanStack Query over the service)
  products.test.tsx
```

Rules:

- A feature owns its components, hooks, and tests.
- A feature does not import another feature's internals. If two features need the same thing, promote it to the app's `components/`, or to a package if both apps need it.
- No barrel files. Import from the file that defines the thing.
- Promote code only when a second consumer exists. Start local.

### Routes

- Route modules are thin. They render a feature component and set up loaders or metadata. No business logic.
- All URLs live under a locale prefix: `/:lang/...` where `lang` is `ar` or `en`.
- The locale is read from the URL. It is never stored in global state.
- The root layout sets `<html lang>` and `dir` from the URL locale.

## 5. Data flow

```
Component ──► hook (TanStack Query) ──► service (packages/api) ──► mock adapter (today)
                                                              └──► HTTP adapter (later)
```

- **Types and schemas** live in `packages/domain` as Zod schemas with inferred types. Everything else imports them from there.
- **Services** are interfaces in `packages/api` (for example `ProductService`, `OrderService`). Each has a mock implementation with typed fake data.
- **A factory** picks the implementation. Switching to a real backend means writing an HTTP adapter and changing the factory. No component or hook should change.
- **Hooks** call services and own query keys, caching, and invalidation.
- **Components** never call `fetch`, never import mock data, and never import adapters directly.

Mock data rules:

- Typed against the domain schemas.
- Keys and codes are obviously fake (`XXXXX-XXXXX-XXXXX`).
- No fake network layers (`setTimeout` pseudo-APIs, `msw`) without agreement.

## 6. State management

| Kind of state | Tool | Where it lives |
| --- | --- | --- |
| Server data | TanStack Query | feature `hooks/` |
| Forms | React Hook Form + Zod | feature `components/`, schemas from `domain` |
| Cart | Zustand | `features/cart` in the storefront |
| Locale | URL | router |
| Theme | provider + CSS tokens | `app/` |
| Everything else | local component state | the component |

A new global store needs explicit approval.

## 7. UI layer

- `packages/ui` holds generated shadcn components on **Base UI** primitives. Composition uses the `render` prop, not `asChild`. Do not import from Radix.
- Do not edit generated components directly. Wrap or compose them in app code.
- Styling uses **semantic tokens only**. No raw hex values or arbitrary Tailwind values.
- Dark mode works for every component from the start.
- Use **logical CSS properties** (`ms-*`, `ps-*`, `start-*`, `text-start`) so RTL works without overrides.

## 8. Internationalization and formatting

- `packages/i18n` owns the react-i18next config, the `ar` and `en` JSON files, and typed keys.
- Every user-facing string uses a key. Both languages must be updated together.
- All money, number, and date formatting goes through the shared helpers in `packages/domain`, built on `Intl`.
- **Western digits (0-9) are always used**, including in Arabic.
- Currencies: EGP, other GCC currencies, USD. Amounts are stored in minor units or as strings with an explicit currency code. No floating-point money math.

## 9. Security considerations for a keys marketplace

- Purchased codes are shown behind an explicit **reveal and copy** pattern, never in plain text by default.
- Never log keys, codes, tokens, or personal data.
- No secrets in source. Environment values come from `.env`, with a committed `.env.example` listing the names only.
- The admin app handles higher-risk actions (inventory, refunds, user data). Keep its code and routes clearly separated from the storefront.

## 10. Testing strategy

- **Vitest + Testing Library** for components, hooks, services, and formatters. Query by role and label.
- Locale-sensitive components get tests in both `ar` and `en`.
- **Playwright** is planned for the storefront purchase flow once it exists.
- CI runs typecheck, lint, test, and build on every pull request.

## 11. Adding things

**A new feature**
1. Create `features/<name>/` in the app with `components/`, `hooks/`, and a test.
2. Add domain types or schemas to `packages/domain` if they are shared.
3. Add a service interface and mock adapter to `packages/api` if it needs data.
4. Add a thin route module under `routes/`.
5. Add `ar` and `en` strings to `packages/i18n`.

**A new package**
Needs a second consumer and an ADR. Declare its allowed imports in section 3.

**A new shadcn component**
Add through the CLI. Do not hand-edit it afterwards.

## 12. Enforcement

Prefer tooling over convention where possible:

- ESLint rules banning physical-direction Tailwind classes and raw color values.
- An import-boundaries rule enforcing section 3 (adding it requires a new dependency, so ask first).
- CI blocks merges when typecheck, lint, test, or build fail.

## 13. Open questions

Record unresolved decisions here until an ADR settles them, for example: auth approach for the admin app, payment provider integration, and code delivery mechanism after purchase.