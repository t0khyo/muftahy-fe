import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { BrandHorizontalLogo } from '../brand-logo'

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
      className={`cursor-pointer inline-flex items-center transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        className ?? ''
      }`}
    >
      <BrandHorizontalLogo
        lang={currentLang}
        alt=""
        className="h-8 w-auto shrink-0"
      />
    </Link>
  )
}
