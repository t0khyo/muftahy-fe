# storefront

## Overview

Customer-facing storefront web application for Muftahy — a digital marketplace for game codes, software licenses, and subscriptions targeting Middle East and GCC customers. Built with React 19, TypeScript, Vite, Tailwind CSS with semantic tokens, and React Router v7. Supports full RTL (Arabic) and LTR (English) localization.

## Subdirectories & Boundaries

- **src**: [`./src/README.md`](./src/README.md) — Application source tree including app bootstrap, core layouts, components, feature modules, and route entry points.

## Invariants

- All customer routes are scoped under `/:lang` prefix (`/ar` and `/en`).
- Depends on shared workspace packages (`@workspace/ui`, `@workspace/domain`, `@workspace/i18n`, `@workspace/api`); never imports from `apps/admin`.
- Strictly adheres to semantic design tokens and logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`).
- All currency amounts formatted using shared domain formatters with Western digits.

## Side Effects

- Client-side navigation and React Query cache management.
- Writes theme preference to `localStorage` and toggles `dark`/`light` on `<html>`.

## Verification

- Run: `pnpm test`
