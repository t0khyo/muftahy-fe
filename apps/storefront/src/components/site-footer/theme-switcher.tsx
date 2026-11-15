import { useTranslation } from 'react-i18next'
import { Button } from '@workspace/ui/components/button'
import { useTheme, type Theme } from '../../app/theme-context'

export interface ThemeSwitcherProps {
  className?: string
}

function SunIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
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

function MoonIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
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

function MonitorIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
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
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  )
}

export function ThemeSwitcher({ className = '' }: ThemeSwitcherProps) {
  const { t } = useTranslation(['common'])
  const { theme, setTheme } = useTheme()

  const options: {
    value: Theme
    labelKey: 'theme.light' | 'theme.dark' | 'theme.system'
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { value: 'light', labelKey: 'theme.light', icon: SunIcon },
    { value: 'dark', labelKey: 'theme.dark', icon: MoonIcon },
    { value: 'system', labelKey: 'theme.system', icon: MonitorIcon },
  ]

  return (
    <div
      role="group"
      aria-label={t('theme.toggle', { ns: 'common' })}
      className={`inline-flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 ${className}`}
    >
      {options.map((opt) => {
        const Icon = opt.icon
        const isSelected = theme === opt.value
        const label = t(opt.labelKey, { ns: 'common' })

        return (
          <Button
            key={opt.value}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTheme(opt.value)}
            aria-pressed={isSelected}
            aria-label={label}
            title={label}
            className={`h-7 px-2 text-xs font-medium rounded-md transition-all ${
              isSelected
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="ms-1 hidden sm:inline">{label}</span>
          </Button>
        )
      })}
    </div>
  )
}
