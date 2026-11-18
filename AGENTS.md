# AGENTS.md

Guidance for AI coding agents working in the Muftahy repo. Read this before changing anything. If a rule here conflicts with a direct instruction from the user, follow the user.

## Project

Muftahy is a digital marketplace for digital keys, game codes, software licenses, and subscriptions, targeting customers in the Middle East and GCC.

- **Surfaces:** a customer-facing storefront and an admin dashboard.
- **Languages:** Arabic (RTL) and English (LTR), both first-class.
- **Current scope:** frontend UI only. There is no backend. Do not invent one.

## Stack

- React + TypeScript (strict) + Vite
- pnpm workspaces monorepo
- shadcn/ui built on **Base UI** primitives (not Radix)
- Tailwind with semantic theme tokens
- React Router v7, TanStack Query, React Hook Form + Zod, Zustand (cart only)
- react-i18next
- Vitest + Testing Library (Playwright is planned for storefront checkout)

## Repo layout

```
apps/
  storefront/src/
    app/            entry, providers, router setup, root layout
    routes/         thin route modules under /:lang/..., no logic
    features/       products, cart, checkout, account, ...
    components/     app-wide pieces (header, footer, language switcher)
    lib/            app-only helpers
  admin/src/        same shape; features: products, orders, inventory, users
packages/
  ui/               shadcn + Base UI components (generated, no business logic)
  i18n/             react-i18next setup, ar/en JSON, typed keys
  domain/           types, Zod schemas, money/number/date formatters
  api/              service interfaces + mock adapters (future backend seam)
  config/           shared tsconfig, eslint, tailwind base
docs/
  architecture.md   boundaries and reasoning, read before structural changes
  decisions/        short ADRs
```

Dependency direction: `apps` import from `packages`, never the reverse. `ui` imports from no other workspace package. Read `docs/architecture.md` before adding a package, a feature, or a cross-feature import. Adjust folder names if the actual layout differs and keep this section accurate.

## Commands

Run from the repo root unless noted. Verify names against `package.json` before relying on them.

```
pnpm install
pnpm dev                          # run apps
pnpm --filter storefront dev      # run one app
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Definition of done

A task is not done until all of these pass for the affected packages:

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test` (add or update tests for new logic and components)
4. `pnpm build`

If you cannot run a check, say so explicitly. Never claim it passes.

## Ask before you

Stop and ask the user first before doing any of these:

- Editing components in `packages/ui` directly
- Changing the shadcn preset or its config (`components.json`, preset settings)
- Touching lockfiles (`pnpm-lock.yaml`)
- Running destructive git commands (`reset --hard`, `clean -fd`, force push, branch deletion, history rewrites)

## UI components

- **shadcn components are the default for all UI.** Before building anything, check whether a shadcn component exists for it. Add missing ones with the CLI, not by hand-writing copies.
- Do not use raw HTML elements for things shadcn provides (buttons, inputs, selects, dialogs, tabs, tooltips, cards, and so on).
- Compose and wrap components in the app or in feature folders. Do not fork `packages/ui` internals.
- Primitives are **Base UI**. Use its composition pattern (the `render` prop), not Radix's `asChild`. Do not import from `@radix-ui/*`.
- Prefer existing primitives over custom widgets.

## Styling
 
- Follow `docs/design-system.md` for every visual decision (colors, fonts, type scale, spacing, theming). Do not invent values.
- Use **semantic tokens only** (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, and so on).
- Never use raw hex colors, `rgb()`, or arbitrary values like `bg-[#123456]` or `w-[137px]`. If a token is missing, ask.
- **Dark mode is supported from day one.** Every new component must look correct in both themes. Do not use `dark:` overrides to patch around missing tokens.

## RTL and internationalization

- Use **logical CSS properties everywhere**: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `border-s`, `border-e`, `rounded-s-*`, `rounded-e-*`.
- Never use physical direction utilities (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`) unless a physical direction is genuinely required, and then comment why.
- Icons that imply direction (arrows, chevrons) must flip in RTL.
- All user-facing strings go through **react-i18next**. No hardcoded strings in components. Add keys for both `ar` and `en`.
- The locale lives in the URL prefix (`/ar/...`, `/en/...`). It is not stored in global state. `<html>` must carry the correct `lang` and `dir`.
- Check layouts in both directions before finishing UI work.

## Numbers, currency, and dates

- Always use **Western digits (0-9)** in both Arabic and English.
- Supported currencies: **EGP**, other GCC currencies, and **USD**.
- Format all money, numbers, and dates through the single shared `Intl`-based helper. Never format inline or concatenate currency symbols by hand.
- Store amounts in minor units or as strings with an explicit currency code. Never use floating-point math for money.

## Data and the service layer

There is no backend. Handle data like this:

- Define domain types and Zod schemas in a shared location.
- Mock data is **typed** and lives behind a thin **service layer** (for example `features/catalog/services/`).
- Components and hooks call services (via TanStack Query). They never call `fetch` directly and never import mock data directly.
- Swapping mock services for real API calls later must require changes only inside the service layer.
- Do not add fake `fetch`, `setTimeout` pseudo-APIs, or `msw` without asking.

## State management

- **Server state:** TanStack Query.
- **Forms:** React Hook Form + Zod, reusing shared schemas where possible.
- **Cart:** Zustand. Nothing else gets a global store without asking.
- **Locale:** from the URL.
- Prefer local component state first.

## Accessibility

Baseline is **WCAG 2.1 AA**. shadcn/Base UI components already handle most of it (roles, keyboard support, focus management), so using them correctly is the main accessibility rule.

- Use shadcn components for every interactive element. Never write raw `<button>`, `<input>`, `<select>`, `<dialog>`, or custom dropdowns, tabs, modals, or tooltips when a shadcn component exists.
- Use plain semantic HTML only for page structure that shadcn has no component for: landmarks (`header`, `nav`, `main`, `footer`), headings in logical order, lists, and tables.
- Keep the keyboard behavior and visible focus states the components provide. Do not remove focus outlines.
- Form fields must have labels and associated error messages. Use the shadcn form and field components.
- Meaningful images have localized alt text. Decorative ones have empty alt.
- Icon-only buttons need an accessible label (`aria-label` using a translated string).

## Security-minded UI

This product sells keys and codes. Treat them as sensitive even in mock data.

- Mock keys and codes must be obviously fake (`XXXXX-XXXXX-XXXXX`). Never use real or real-looking keys.
- Never log keys, codes, tokens, or personal data (`console.log` included).
- Display purchased codes behind an explicit **reveal and copy** pattern. Do not render them in plain text by default.
- Do not put secrets or environment values in source files.

## Code conventions

- **Files:** kebab-case (`product-card.tsx`)
- **Components:** PascalCase
- **Exports:** named exports. Default exports only where a tool requires them.
- **No barrel files** (`index.ts` re-exports).
- **Structure:** feature folders (`features/catalog/...`) containing components, hooks, services, and tests together.
- **Imports:** use workspace aliases (`@workspace/ui/...`). No deep relative paths across packages.
- **TypeScript:** strict mode. No `any`. No `@ts-ignore` without a comment explaining why. Prefer `unknown` plus narrowing.
- Keep components small and focused. Extract logic into hooks or services.

## Testing

- Vitest + Testing Library for components, hooks, and services.
- Test behavior, not implementation details. Query by role and label.
- New logic, bug fixes, and formatting helpers need tests.
- Include RTL and Arabic cases for locale-sensitive components.

## Git and PRs

- **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`).
- Small, focused changes. One concern per commit and per PR.
- Never commit directly to `main`.
- **Do not commit or push unless the user asks you to.**
- PR descriptions state what changed, why, and how it was verified.

## When unsure

Ask a short, specific question rather than guessing. If a task conflicts with this file, say so and propose an alternative.