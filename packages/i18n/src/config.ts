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

export const detectDeviceLanguage = (): SupportedLanguage => {
  if (typeof navigator !== 'undefined') {
    const candidates =
      Array.isArray(navigator.languages) && navigator.languages.length > 0
        ? navigator.languages
        : navigator.language
          ? [navigator.language]
          : []

    for (const tag of candidates) {
      const primary = tag.split('-')[0]?.toLowerCase()
      if (primary && isSupportedLanguage(primary)) {
        return primary
      }
    }
  }
  return 'ar'
}

export const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window !== 'undefined') {
    const segment = window.location.pathname.split('/')[1]
    if (segment && isSupportedLanguage(segment)) {
      return segment
    }
  }
  return DEFAULT_LANGUAGE
}

export const applyLanguage = (lang: SupportedLanguage): void => {
  if (i18n.language !== lang) {
    void i18n.changeLanguage(lang)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }
}

const initialLang = getInitialLanguage()

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: initialLang,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: DEFAULT_NAMESPACE,
    initImmediate: false,
    ns: ['common', 'nav', 'header', 'footer', 'search', 'cart', 'products', 'design', 'home', 'detail', 'auth', 'account', 'admin', 'notFound'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

  if (typeof document !== 'undefined') {
    document.documentElement.lang = initialLang
    document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr'
  }
}

export { i18n }
export type { SupportedLanguage } from './types'
