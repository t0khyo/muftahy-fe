# @workspace/i18n

## Overview

Internationalisation package for the Muftahy frontend. Configures `react-i18next` with Arabic and English resources, typed key access, and a singleton `i18n` instance. The active locale is not stored here — it is driven by the URL prefix (`/ar/...`, `/en/...`). Both locales must always be updated together.

## Interface

- src: [./src/README.md](./src/README.md) - Source root containing configuration, type definitions, and locale setup
- `@workspace/i18n/config` — singleton `i18n` instance, `SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE`, `isSupportedLanguage`, and initialization helpers
- `@workspace/i18n/types` — `SupportedLanguage` and `TranslationResources` type augmentation

## Invariants

- `i18n.isInitialized` guard prevents double-initialisation when the module is imported from multiple entry points.
- `useSuspense: false` — components handle loading states without requiring React Suspense.
- Both `ar` and `en` resources must maintain identical key structures.
- The locale is never persisted in global state; it is derived from the URL.

## Side Effects

- Calls `i18n.use(initReactI18next).init(...)` at module load time; mutates `document.documentElement.lang` and `dir` in browser environments.
- Statically bundles translation files with zero runtime network requests.

## Verification

- Run: `pnpm test`
