import * as React from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { KeyRound, ShieldCheck, Zap } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { BrandLogoMark } from '../../../components/brand-logo'

export interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
  panelHeadline?: string
  panelTagline?: string
}

export function AuthLayout({
  children,
  className,
  panelHeadline,
  panelTagline,
}: AuthLayoutProps) {
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const { t } = useTranslation('auth')

  const headline = panelHeadline || t('brandHeadline')
  const tagline = panelTagline || t('brandTagline')

  return (
    <div className="grid min-h-[calc(100svh-4.5rem)] w-full lg:grid-cols-[2fr_3fr] border-b border-border">
      {/* Brand panel — visible on large screens */}
      <div
        className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground"
        aria-hidden="true"
      >
        {/* Subtle patterned overlay using decorative geometric grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_start,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />

        {/* Brand header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground p-1.5 shadow-sm">
            <BrandLogoMark className="size-7 shrink-0" idPrefix="auth-layout-brand-logo" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-primary-foreground">
            Muftahy
          </span>
        </div>

        {/* Center brand hero & decorative graphic */}
        <div className="relative z-10 my-auto py-8">
          <div className="max-w-md space-y-4">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight leading-tight lg:text-4xl text-primary-foreground">
              {headline}
            </h1>
            <p className="text-primary-foreground/80 text-base leading-relaxed">
              {tagline}
            </p>
          </div>

          {/* Decorative key/digital license cards visual */}
          <div className="mt-8 grid grid-cols-3 gap-3 opacity-25">
            <div className="flex flex-col items-center justify-center rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 p-4 text-center">
              <Zap className="size-6 mb-2" />
              <span className="text-xs font-semibold tracking-wider uppercase">Instant</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 p-4 text-center">
              <KeyRound className="size-6 mb-2" />
              <span className="text-xs font-semibold tracking-wider uppercase">Genuine</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 p-4 text-center">
              <ShieldCheck className="size-6 mb-2" />
              <span className="text-xs font-semibold tracking-wider uppercase">Secure</span>
            </div>
          </div>
        </div>

        {/* Brand footer quote */}
        <div className="relative z-10 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/75">
          {t('brandTrust')}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-10 lg:py-16">
        {/* Mobile brand mark */}
        <div className="mb-6 flex lg:hidden items-center justify-center">
          <Link to={`/${lang}`} className="flex items-center gap-2.5 font-medium">
            <BrandLogoMark className="h-8 w-auto shrink-0" idPrefix="auth-layout-mobile-logo" />
            <span className="font-heading font-bold text-lg tracking-tight">Muftahy</span>
          </Link>
        </div>

        {/* Main form container with entrance transition */}
        <div className={cn('auth-enter w-full max-w-md', className)}>
          {children}
        </div>
      </div>
    </div>
  )
}
