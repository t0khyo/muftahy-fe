import { Button } from '@workspace/ui/components/button'
import { useTheme } from '../app/theme-context'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={
        resolvedTheme === 'dark'
          ? 'Switch to light theme'
          : 'Switch to dark theme'
      }
    >
      {resolvedTheme === 'dark' ? '☀️' : '🌙'}
    </Button>
  )
}
