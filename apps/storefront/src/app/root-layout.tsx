import * as React from 'react'
import { Navigate, Outlet, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  applyLanguage,
  detectDeviceLanguage,
  isSupportedLanguage,
  type SupportedLanguage,
} from '@workspace/i18n/config'
import { Toaster } from '@workspace/ui/components/sonner'
import { useTheme } from './theme-context'
import { SiteFooter } from '../components/site-footer/site-footer'
import { SiteHeader } from '../components/site-header/site-header'

export function RootLayout() {
  const { lang } = useParams<{ lang: string }>()
  const { i18n } = useTranslation()
  const { theme } = useTheme()

  const isValidLang = Boolean(lang && isSupportedLanguage(lang))
  const currentLang: SupportedLanguage = isValidLang ? (lang as SupportedLanguage) : 'en'

  if (isValidLang && i18n.language !== currentLang) {
    applyLanguage(currentLang)
  }

  React.useEffect(() => {
    if (isValidLang) {
      applyLanguage(currentLang)
    }
  }, [isValidLang, currentLang])

  if (!isValidLang) {
    return <Navigate to={`/${detectDeviceLanguage()}`} replace />
  }

  return (
    <div key={currentLang} className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Scroll sentinel for header IntersectionObserver border detection */}
      <div
        id="nav-sentinel"
        className="h-[1px] w-full pointer-events-none -mb-[1px]"
        aria-hidden="true"
      />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <SiteFooter />
      <Toaster
        theme={theme}
        dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
        position={currentLang === 'ar' ? 'bottom-left' : 'bottom-right'}
      />
    </div>
  )
}

