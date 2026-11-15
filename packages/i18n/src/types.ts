import type en from './locales/en.json'

export type SupportedLanguage = 'ar' | 'en'

export type TranslationResources = typeof en

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: typeof en
  }
}

