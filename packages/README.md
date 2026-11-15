# Packages Blueprint

## System Overview

Shared workspace packages for the Muftahy frontend monorepo. Packages form a strict one-way dependency graph: `apps` import from `packages`; `packages` never import from `apps`. Within packages, only `api` may import from `domain`; `ui`, `i18n`, `domain`, and `config` are leaves with no cross-workspace imports. All packages are private and versioned at `0.0.0`.

## Subdirectories & System Boundaries

- `api/`: [./api/README.md](./api/README.md) — Service interfaces and adapters; `ProductService` contract + mock in-memory implementation; seam for future HTTP backend
- `domain/`: [./domain/README.md](./domain/README.md) — Zod schemas, TypeScript types, and `Intl`-based formatters; foundational type source for all other packages
- `i18n/`: [./i18n/README.md](./i18n/README.md) — `react-i18next` setup, typed key access, and Arabic/English JSON translation files
- `ui/`: [./ui/README.md](./ui/README.md) — shadcn/Base UI component library with RTL support and semantic Tailwind design tokens
- `config/`: [./config/README.md](./config/README.md) — Shared configuration placeholder (tsconfig, eslint, tailwind base; to be populated)

## Global Invariants

- Dependency direction: `api` → `domain`; all others have no cross-workspace imports.
- All money values are stored as minor-unit integers; no floating-point money math anywhere in the packages layer.
- Western digits (0-9) are enforced in all formatted output including Arabic locale.
- Both `ar` and `en` translation keys must be updated together; partial translations are invalid.
- All public UI components use semantic design tokens exclusively; raw hex is prohibited.
- RTL-compatible logical CSS properties are used throughout the UI layer.

## Global Side Effects

- `@workspace/i18n/config` runs `i18n.init()` once at module load time.
- `@workspace/ui` Dialog and Sheet components portal into `document.body`.
- `@workspace/ui/globals.css` sets CSS custom properties on `:root` and `.dark` for the entire document.

## System Verification

- Run: `pnpm test`
