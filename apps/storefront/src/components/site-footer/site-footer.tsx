import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './language-switcher'
import { ThemeSwitcher } from './theme-switcher'
import { BrandLogoMark } from '../brand-logo'

export interface SiteFooterProps {
  className?: string
}

export function SiteFooter({ className = '' }: SiteFooterProps) {
  const { t } = useTranslation(['footer', 'common'])
  const currentYear = new Date().getFullYear()

  return (
    <footer
      aria-label="Site Footer"
      className={`w-full border-t border-border/40 bg-background/80 py-6 text-muted-foreground ${className}`}
    >
      <div className="mx-auto flex max-w-[var(--header-max-width,1024px)] flex-col items-center justify-between gap-4 px-[var(--header-inline-padding-mobile,16px)] sm:flex-row lg:px-[var(--header-inline-padding,22px)]">
        {/* Copyright notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground text-center sm:text-start">
          <BrandLogoMark className="h-4.5 w-auto shrink-0 opacity-70" idPrefix="footer-logo" />
          <p>
            © {currentYear} {t('appName', { ns: 'common' })}. {t('allRightsReserved', { ns: 'footer' })}
          </p>
        </div>

        {/* Controls: Theme & Language */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <div className="h-4 w-[1px] bg-border/60" aria-hidden="true" />
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  )
}

