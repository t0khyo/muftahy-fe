import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './locales/ar.json'
import en from './locales/en.json'
import type { SupportedLanguage } from './types'

export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'
export const DEFAULT_NAMESPACE = 'common'

export const resources = {
  ar,
  en,
} as const

export const isSupportedLanguage = (lang: string): lang is SupportedLanguage => {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: DEFAULT_NAMESPACE,
    ns: ['common', 'nav', 'products'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })
}

export { i18n }
export type { SupportedLanguage } from './types.ts'
