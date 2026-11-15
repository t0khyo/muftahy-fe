import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation(['common'])
  const currentYear = new Date().getFullYear() // 2026, Western digits

  return (
    <footer className="w-full border-t border-border bg-background py-8 text-sm text-muted-foreground">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <p>
          © {currentYear} {t('appName', { ns: 'common' })}. All rights reserved.
        </p>
        <p className="text-xs">
          Digital Keys, Game Codes, and Software Licenses for MENA & GCC
        </p>
      </div>
    </footer>
  )
}

