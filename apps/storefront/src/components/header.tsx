import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { LanguageSwitcher } from './language-switcher'
import { ThemeToggle } from './theme-toggle'

export function Header() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['common', 'nav'])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            to={`/${lang}/products`}
            className="flex items-center gap-2 font-heading text-lg font-bold text-foreground"
          >
            <span className="text-primary">🔑</span>
            <span>{t('appName', { ns: 'common' })}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              to={`/${lang}/products`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('products', { ns: 'nav' })}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

