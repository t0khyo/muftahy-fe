# i18n/src

## Overview

Source implementation of the `@workspace/i18n` package, providing i18next configuration, TypeScript type definitions for translation resources, and browser document direction management.

## Interface

- `[config.ts:SUPPORTED_LANGUAGES]` `const SUPPORTED_LANGUAGES: readonly ['ar', 'en']` — list of valid locale codes
- `[config.ts:DEFAULT_LANGUAGE]` `const DEFAULT_LANGUAGE: SupportedLanguage` — default fallback locale (`'en'`)
- `[config.ts:DEFAULT_NAMESPACE]` `const DEFAULT_NAMESPACE: 'common'` — default translation namespace
- `[config.ts:resources]` `const resources: { readonly ar: typeof ar; readonly en: typeof en }` — bundled translation resources
- `[config.ts:isSupportedLanguage]` `(lang: string): lang is SupportedLanguage` — type guard checking if string matches a supported locale
- `[config.ts:getInitialLanguage]` `(): SupportedLanguage` — extracts initial locale from the first path segment of `window.location.pathname` or returns `DEFAULT_LANGUAGE`
- `[config.ts:i18n]` `i18n` — singleton `i18next` instance initialized with react-i18next
- `[types.ts:SupportedLanguage]` `type SupportedLanguage = 'ar' | 'en'` — union of supported language codes
- `[types.ts:TranslationResources]` `type TranslationResources = typeof en` — typed representation of translation keys augmented into `i18next.CustomTypeOptions`

## Invariants

- `[config.ts:i18n]` Guarded by `!i18n.isInitialized` to guarantee single-initialization across multiple module imports.
- `[config.ts:react]` `useSuspense: false` is configured so that components handle loading without requiring React Suspense.
- `[config.ts:document]` Sets `document.documentElement.lang` to the active language and `document.documentElement.dir` to `'rtl'` for Arabic or `'ltr'` for English if `window` is defined.

## Side Effects

- `[config.ts:i18n.init]` Initializes the global i18next instance and mutates `document.documentElement` attributes (`lang`, `dir`) at module load time in browser environments.

## Verification

- Run: `pnpm test`
