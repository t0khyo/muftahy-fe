import * as React from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { User } from 'lucide-react'
import { Blobatar } from '@workspace/ui/components/blobatar'
import { getLocalizedNavLinks, getNavKey } from './nav-links'
import { LanguageSwitcher } from '../language-switcher'
import { ThemeToggle } from '../theme-toggle'
import { useAuth } from '../../features/auth/hooks/use-auth'

export interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  id?: string
}

export function MobileMenu({ isOpen, onClose, id = 'mobile-menu' }: MobileMenuProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const isAr = currentLang === 'ar'
  const location = useLocation()
  const { t } = useTranslation(['nav'])

  const links = React.useMemo(() => getLocalizedNavLinks(currentLang), [currentLang])
  const { user, isAuthenticated, logout } = useAuth()

  // Lock body scroll while open
  React.useEffect(() => {
    if (isOpen) {
      document.body.setAttribute('data-header-locked', 'true')
      return () => {
        document.body.removeAttribute('data-header-locked')
      }
    }
  }, [isOpen])

  // Close on route change
  React.useEffect(() => {
    if (isOpen) {
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])

  // Close on Esc key
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Close when viewport expands past lg (1024px)
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) {
        onClose()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      id={id}
      style={{
        top: 'var(--header-height-mobile, 48px)',
        transitionProperty: 'opacity, transform',
        transitionDuration: 'var(--header-duration-base, 300ms)',
        transitionTimingFunction: 'var(--header-ease)',
      }}
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden bg-background overflow-y-auto px-6 py-6 flex flex-col justify-between animate-in fade-in duration-200"
    >
      <div className="space-y-6">
        {/* Large Nav Links with Staggered Animation */}
        <nav aria-label="Mobile" className="flex flex-col space-y-4 pt-2 text-start">
          {links.map((link, index) => {
            const currentPathAndSearch = location.pathname + location.search
            const isActive = link.href.includes('?')
              ? currentPathAndSearch === link.href
              : location.pathname === link.href && !location.search

            return (
              <div
                key={link.id}
                style={{
                  animation: `header-fade-in var(--header-duration-base, 300ms) var(--header-ease) both`,
                  animationDelay: `${index * 35}ms`,
                }}
              >
                <Link
                  to={link.href}
                  onClick={onClose}
                  className={`cursor-pointer block py-1 text-[28px] font-semibold tracking-tight transition-colors ${
                    isAr ? 'leading-normal' : 'leading-tight'
                  } ${
                    isActive
                      ? 'text-foreground'
                      : 'text-foreground/80 hover:text-foreground'
                  }`}
                >
                  {t(getNavKey(link.labelKey), { ns: 'nav', defaultValue: link.id })}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* Mobile Account Section */}
        <div className="border-t border-border/40 pt-4 space-y-2">
          {isAuthenticated ? (
            <div className="flex items-center justify-between gap-3 text-start">
              <Link
                to={`/${currentLang}/account/profile`}
                onClick={onClose}
                className="flex items-center gap-3 min-w-0 group"
              >
                <Blobatar
                  name={user?.full_name || user?.email || (isAr ? 'حسابي' : 'My Account')}
                  className="size-9 shrink-0"
                  blobatar={{ animate: 'hover' }}
                />
                <div className="min-w-0">
                  <span className="block truncate text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {user?.full_name || user?.email || (isAr ? 'حسابي' : 'My Account')}
                  </span>
                  {user?.full_name && user?.email && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  )}
                </div>
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  logout()
                }}
                className="shrink-0 text-sm font-medium text-destructive hover:underline cursor-pointer"
              >
                {isAr ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                aria-hidden="true"
              >
                <User className="size-4" />
              </div>
              <Link
                to={`/${currentLang}/login`}
                onClick={onClose}
                className="text-base font-semibold text-primary hover:underline"
              >
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link
                to={`/${currentLang}/register`}
                onClick={onClose}
                className="text-base font-semibold text-foreground hover:text-primary transition-colors"
              >
                {isAr ? 'إنشاء حساب' : 'Create Account'}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Bottom: Appearance & Language Controls */}
      <div className="border-t border-border/40 pt-4 mt-auto flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          {isAr ? 'المظهر واللغة' : 'Appearance & Language'}
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="h-4 w-[1px] bg-border/60" aria-hidden="true" />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Animation Keyframe Style injected for mobile staggered links */}
      <style>{`
        @keyframes header-fade-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
