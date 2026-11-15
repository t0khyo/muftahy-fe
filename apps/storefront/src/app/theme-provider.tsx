import * as React from 'react'
import { ThemeContext, type Theme } from './theme-context'

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'muftahy-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(storageKey) as Theme | null
        if (stored) return stored
      } catch {
        // Fallback to default
      }
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = React.useState<'dark' | 'light'>('light')

  React.useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const isDark =
        theme === 'dark' || (theme === 'system' && mediaQuery.matches)

      root.classList.remove('light', 'dark')
      root.classList.add(isDark ? 'dark' : 'light')
      setResolvedTheme(isDark ? 'dark' : 'light')
    }

    applyTheme()

    const listener = () => {
      if (theme === 'system') {
        applyTheme()
      }
    }

    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [theme])

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (newTheme: Theme) => {
        try {
          window.localStorage?.setItem(storageKey, newTheme)
        } catch {
          // Ignore
        }
        setTheme(newTheme)
      },
    }),
    [theme, resolvedTheme, storageKey],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
