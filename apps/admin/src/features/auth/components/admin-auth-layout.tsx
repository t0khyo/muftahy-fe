import * as React from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Lock, Terminal, Globe, Moon, Sun } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { useTheme } from '../../../app/theme-context'
import { cn } from '@workspace/ui/lib/utils'
import { BrandLogoMark } from '../../../components/brand-logo'

export interface AdminAuthLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AdminAuthLayout({ children, className }: AdminAuthLayoutProps) {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation('admin')
  const { theme, setTheme } = useTheme()

  const otherLang = lang === 'ar' ? 'en' : 'ar'
  const otherLangLabel = lang === 'ar' ? 'English' : 'العربية'

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="grid min-h-svh w-full lg:grid-cols-[2fr_3fr] bg-background text-foreground">
      {/* Brand & Security Operator panel — large screens only */}
      <div
        className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-foreground p-12 text-background"
        aria-hidden="true"
      >
        {/* Subtle security mesh overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_start,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />

        {/* Console wordmark */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-background p-1.5 shadow-sm">
              <BrandLogoMark className="size-7 shrink-0" idPrefix="admin-auth-brand-logo" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg tracking-tight text-background">
                Muftahy
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-background/60">
                Security Console
              </span>
            </div>
          </div>
        </div>

        {/* Center security context */}
        <div className="relative z-10 my-auto py-8">
          <div className="max-w-md space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/5 px-3 py-1 text-xs font-mono text-background/80">
              <Lock className="size-3 text-background" />
              <span>Restricted Access Area</span>
            </div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight leading-tight lg:text-4xl text-background">
              {t('signInTitle', 'Administrator Access')}
            </h1>
            <p className="text-background/70 text-sm leading-relaxed">
              {t('signInSubtitle', 'Enter your operator credentials to access the management portal')}
            </p>
          </div>

          {/* Operational status indicators */}
          <div className="mt-8 grid grid-cols-2 gap-3 opacity-60">
            <div className="flex items-center gap-3 rounded-md border border-background/20 bg-background/5 p-3">
              <Terminal className="size-4 shrink-0 text-background" />
              <div className="text-xs font-mono">
                <div className="text-background font-semibold">Audit Logging</div>
                <div className="text-background/60 text-[10px]">Active & Recorded</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-background/20 bg-background/5 p-3">
              <ShieldCheck className="size-4 shrink-0 text-background" />
              <div className="text-xs font-mono">
                <div className="text-background font-semibold">Session Guard</div>
                <div className="text-background/60 text-[10px]">Zero-Trust Enforcement</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer verification note */}
        <div className="relative z-10 border-t border-background/15 pt-6 text-[11px] font-mono text-background/60">
          © 2026 Muftahy Ops · Protected by 2FA & IP Allowlist
        </div>
      </div>

      {/* Main form column */}
      <div className="flex flex-col justify-between px-6 py-8 md:px-12 lg:px-16">
        {/* Top utility bar */}
        <header className="flex w-full items-center justify-between pb-6">
          <div className="flex lg:hidden items-center gap-2.5">
            <BrandLogoMark className="h-7 w-auto shrink-0" idPrefix="admin-auth-mobile-logo" />
            <span className="font-heading font-bold text-lg tracking-tight">Muftahy</span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary uppercase">
              Admin
            </span>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-8 w-8 p-0"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              render={<Link to={`/${otherLang}/login`} />}
              className="h-8 gap-1.5 text-xs"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{otherLangLabel}</span>
            </Button>
          </div>
        </header>

        {/* Form body */}
        <main className="my-auto flex w-full flex-col items-center justify-center">
          <div className={cn('auth-enter w-full max-w-sm', className)}>
            {children}
          </div>
        </main>

        {/* Footer info */}
        <footer className="pt-6 text-center text-xs text-muted-foreground">
          <p>© 2026 Muftahy. {t('subtitle', 'Secure Operator Console')}</p>
        </footer>
      </div>
    </div>
  )
}
