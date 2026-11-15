import { useTranslation } from 'react-i18next'
import { Button } from '@workspace/ui/components/button'
import { useTheme, type Theme } from '../app/theme-context'

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

export function ThemeToggle() {
  const { t } = useTranslation(['common'])
  const { theme, resolvedTheme, setTheme } = useTheme()

  const handleCycleTheme = () => {
    const nextTheme: Theme =
      theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
    setTheme(nextTheme)
  }

  const label =
    theme === 'system'
      ? `${t('theme.system', { ns: 'common' })} (${resolvedTheme === 'dark' ? t('theme.dark', { ns: 'common' }) : t('theme.light', { ns: 'common' })})`
      : theme === 'dark'
        ? t('theme.dark', { ns: 'common' })
        : t('theme.light', { ns: 'common' })

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCycleTheme}
      aria-label={`${t('theme.toggle', { ns: 'common' })}: ${label}`}
      title={`${t('theme.toggle', { ns: 'common' })}: ${label}`}
      className="relative"
    >
      {resolvedTheme === 'dark' ? (
        <MoonIcon className="size-4" />
      ) : (
        <SunIcon className="size-4" />
      )}
      {theme === 'system' && (
        <span
          className="absolute bottom-1 end-1 size-1.5 rounded-full bg-primary"
          aria-hidden="true"
        />
      )}
    </Button>
  )
}
