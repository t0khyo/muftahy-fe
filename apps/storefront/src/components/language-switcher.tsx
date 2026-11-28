import { useLocation, useNavigate, useParams } from 'react-router'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { applyLanguage, type SupportedLanguage } from '@workspace/i18n/config'

export interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { lang } = useParams<{ lang: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const currentLang = (lang === 'ar' ? 'ar' : 'en') as SupportedLanguage
  const nextLang: SupportedLanguage = currentLang === 'ar' ? 'en' : 'ar'
  const nextShortLabel = currentLang === 'ar' ? 'EN' : 'ع'
  const accessibleLabel = currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'

  const handleSwitch = () => {
    applyLanguage(nextLang)
    // Replace the language segment at the start of the path
    const pathWithoutLang = location.pathname.replace(/^\/(?:ar|en)/, '')
    const targetPath = `/${nextLang}${pathWithoutLang || ''}${location.search}${location.hash}`
    navigate(targetPath)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSwitch}
      aria-label={accessibleLabel}
      className={cn(
        'h-8 px-2.5 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
        className
      )}
    >
      <span className={currentLang === 'en' ? 'font-arabic text-sm' : 'font-sans text-xs tracking-wider'}>
        {nextShortLabel}
      </span>
    </Button>
  )
}

