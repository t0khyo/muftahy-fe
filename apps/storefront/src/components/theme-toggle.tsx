import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { useTheme } from '../app/theme-context'

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { t } = useTranslation(['common'])
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const label = isDark
    ? t('theme.light', { ns: 'common', defaultValue: 'Light' })
    : t('theme.dark', { ns: 'common', defaultValue: 'Dark' })

  const ariaLabel = `${t('theme.toggle', { ns: 'common', defaultValue: 'Toggle theme' })}: ${label}`

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleToggle}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        'size-8 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
        className
      )}
    >
      {isDark ? (
        <Sun className="size-4 shrink-0" aria-hidden="true" />
      ) : (
        <Moon className="size-4 shrink-0" aria-hidden="true" />
      )}
      <span className="sr-only">{ariaLabel}</span>
    </Button>
  )
}
