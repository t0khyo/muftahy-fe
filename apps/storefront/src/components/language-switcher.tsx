import { useLocation, useNavigate, useParams } from 'react-router'
import { Button } from '@workspace/ui/components/button'
import type { SupportedLanguage } from '@workspace/i18n/config'

export function LanguageSwitcher() {
  const { lang } = useParams<{ lang: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const currentLang = (lang === 'ar' ? 'ar' : 'en') as SupportedLanguage
  const nextLang: SupportedLanguage = currentLang === 'ar' ? 'en' : 'ar'
  const nextLabel = currentLang === 'ar' ? 'English' : 'العربية'

  const handleSwitch = () => {
    // Replace the language segment at the start of the path
    const pathWithoutLang = location.pathname.replace(/^\/(?:ar|en)/, '')
    const targetPath = `/${nextLang}${pathWithoutLang || ''}${location.search}${location.hash}`
    navigate(targetPath)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSwitch}
      aria-label={`Switch to ${nextLabel}`}
    >
      {nextLabel}
    </Button>
  )
}

