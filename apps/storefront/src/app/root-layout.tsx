import * as React from 'react'
import { Navigate, Outlet, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { isSupportedLanguage, type SupportedLanguage } from '@workspace/i18n/config'
import { SiteFooter } from '../components/site-footer/site-footer'
import { SiteHeader } from '../components/site-header/site-header'

export function RootLayout() {
  const { lang } = useParams<{ lang: string }>()
  const { i18n } = useTranslation()

  const isValidLang = lang && isSupportedLanguage(lang)
  const currentLang: SupportedLanguage = isValidLang ? (lang as SupportedLanguage) : 'en'

  React.useEffect(() => {
    if (isValidLang) {
      if (i18n.language !== currentLang) {
        i18n.changeLanguage(currentLang)
      }
      document.documentElement.lang = currentLang
      document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr'
    }
  }, [isValidLang, currentLang, i18n])

  if (!isValidLang) {
    return <Navigate to="/en/products" replace />
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
    </div>
  )
}

