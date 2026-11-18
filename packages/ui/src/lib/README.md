# UI Lib

## Overview

Shared utility helpers for the `@workspace/ui` package.

## Interface

- `[utils.ts:cn]` `cn(...inputs: ClassValue[]): string` — re-exported from the `cn` package; merges Tailwind class names using `clsx` and `tailwind-merge`, resolving conflicting utility classes in favour of the last one

## Invariants

- `cn` is pure and has no side effects.
- Always use `cn` (never bare string concatenation) when merging class names in components, so conflicting Tailwind utilities are resolved correctly.

## Side Effects

- None.

## Verification

- Run: `pnpm test`
