import * as React from 'react'
import { Navigate, Outlet, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { detectDeviceLanguage, isSupportedLanguage, type SupportedLanguage } from '@workspace/i18n/config'
import { Toaster } from '@workspace/ui/components/sonner'
import { useTheme } from './theme-context'

export function RootLayout() {
  const { lang } = useParams<{ lang: string }>()
  const { i18n } = useTranslation()
  const { resolvedTheme } = useTheme()

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
    return <Navigate to={`/${detectDeviceLanguage()}`} replace />
  }

  return (
    <div key={currentLang} className="min-h-screen bg-background text-foreground">
      <Outlet />
      <Toaster
        dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
        theme={resolvedTheme}
        // Sonner requires physical position names so toasts stay at logical bottom-end away from the sidebar
        position={currentLang === 'ar' ? 'bottom-left' : 'bottom-right'}
      />
    </div>
  )
}
