# @workspace/i18n

## Overview

Internationalisation package for the Muftahy frontend. Configures `react-i18next` with Arabic and English resources, typed key access, and a singleton `i18n` instance. Supports nine namespaces. The active locale is not stored here — it comes from the URL prefix (`/ar/...`, `/en/...`). Both locales must always be updated together.

## Interface

- `@workspace/i18n/config`
  - `i18n` — the configured i18next instance (singleton; safe to import multiple times)
  - `SUPPORTED_LANGUAGES: readonly ['ar', 'en']`
  - `DEFAULT_LANGUAGE: SupportedLanguage` — `'en'`
  - `DEFAULT_NAMESPACE: 'common'`
  - `resources` — bundled translation resources object
  - `isSupportedLanguage(lang: string): lang is SupportedLanguage` — type guard
  - `SupportedLanguage` — `'ar' | 'en'`
- `@workspace/i18n/types`
  - `SupportedLanguage` — `'ar' | 'en'`
  - `TranslationResources` — full type derived from `en.json`; augments the i18next `CustomTypeOptions` for typed `t()` calls
- `@workspace/i18n/locales/ar` — Arabic JSON (import directly if needed)
- `@workspace/i18n/locales/en` — English JSON (import directly if needed)

## Invariants

- `i18n.isInitialized` guard prevents double-initialisation when the module is imported from multiple entry points.
- `useSuspense: false` — components must handle loading states manually; no React Suspense boundary is required.
- Both `ar` and `en` entries in `resources` must always be in sync (same key structure).
- The locale is never persisted in this package; it is derived from the URL at the app layer.

## Side Effects

- Calls `i18n.use(initReactI18next).init(...)` exactly once at module load time.
- No network requests; all translations are statically bundled.

## Verification

- Run: `pnpm test`
