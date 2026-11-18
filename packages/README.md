# Packages Blueprint

## System Overview

Shared workspace packages for the Muftahy frontend monorepo. Packages follow a strict dependency flow: `apps` import from `packages`, never the reverse. Within packages, only `api` imports from `domain`; `ui`, `i18n`, `domain`, and `config` are leaves with no cross-workspace imports.

## Subdirectories & System Boundaries

- api: [./api/README.md](./api/README.md) - Service interfaces and adapters (`ProductService` contract + mock in-memory implementation)
- domain: [./domain/README.md](./domain/README.md) - Zod validation schemas, TypeScript types, and `Intl`-based formatters
- i18n: [./i18n/README.md](./i18n/README.md) - `react-i18next` internationalization configuration, typed key definitions, and locale assets
- ui: [./ui/README.md](./ui/README.md) - shadcn/Base UI component library with RTL support and semantic Tailwind design tokens
- config: [./config/README.md](./config/README.md) - Shared configuration packages (tsconfig, eslint base)

## Global Invariants

- Strict dependency hierarchy: `api` -> `domain`; all other packages are independent leaves with no cross-workspace imports.
- All monetary values are handled as minor-unit integers; floating-point currency math is prohibited.
- Western digits (0-9) are enforced across all locales, including Arabic.
- Both `ar` and `en` translation resources must remain strictly synchronized.
- UI components use semantic theme tokens and logical CSS properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, etc.) for full RTL compatibility.

## Global Side Effects

- `@workspace/i18n` initializes the global `i18next` singleton and mutates root document `lang` and `dir` on load in browser environments.
- `@workspace/ui` dialogs and sheets portal overlay DOM elements directly into `document.body`.
- `@workspace/ui/globals.css` injects global theme variables into `:root` and `.dark`.

## System Verification

- Run: `pnpm test`
