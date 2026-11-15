import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { BrandLogoMark } from '../brand-logo'

export interface SiteLogoProps {
  className?: string
}

export function SiteLogo({ className }: SiteLogoProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const { t } = useTranslation(['common'])

  return (
    <Link
      to={`/${currentLang}`}
      aria-label={t('appName', { ns: 'common' })}
      className={`cursor-pointer inline-flex items-center gap-1.5 text-foreground/80 transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        className ?? ''
      }`}
    >
      <BrandLogoMark className="h-6 w-auto shrink-0" idPrefix="header-logo" />
      {/* Wordmark in matching line height */}
      <span className="font-heading text-sm font-bold tracking-tight text-foreground">
        {t('appName', { ns: 'common' })}
      </span>
    </Link>
  )
}
