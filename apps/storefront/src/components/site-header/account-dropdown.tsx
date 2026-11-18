import * as React from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { User, LogOut, ShoppingBag, KeyRound, LifeBuoy, ChevronDown } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { useAuth } from '../../features/auth/hooks/use-auth'

export function AccountDropdown() {
  const { t } = useTranslation(['auth', 'account', 'common'])
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const { user, isAuthenticated, logout } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const displayName = user?.full_name || user?.email?.split('@')[0] || t('signIn')

  return (
    <div className="relative inline-flex" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 px-2 text-xs font-medium text-foreground/80 hover:text-foreground"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={isAuthenticated ? t('account:title') : t('signIn')}
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User className="h-3.5 w-3.5" />
        </div>
        <span className="hidden md:inline max-w-[120px] truncate">{displayName}</span>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>

      {isOpen && (
        <div
          role="menu"
          className="absolute end-0 top-full mt-1.5 z-50 w-56 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {isAuthenticated ? (
            <>
              {/* User greeting */}
              <div className="px-2.5 py-2 border-b border-border/60 mb-1">
                <p className="text-xs font-semibold text-foreground truncate">{user?.full_name || displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>

              {/* Account navigation items */}
              <Link
                to={`/${lang}/account/profile`}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium hover:bg-muted text-foreground/90 hover:text-foreground transition-colors"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t('account:nav.profile')}</span>
              </Link>

              <Link
                to={`/${lang}/account/orders`}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium hover:bg-muted text-foreground/90 hover:text-foreground transition-colors"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t('account:nav.orders')}</span>
              </Link>

              <Link
                to={`/${lang}/account/keys`}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium hover:bg-muted text-foreground/90 hover:text-foreground transition-colors"
              >
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t('account:nav.keys')}</span>
              </Link>

              <Link
                to={`/${lang}/account/support`}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium hover:bg-muted text-foreground/90 hover:text-foreground transition-colors"
              >
                <LifeBuoy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t('account:nav.support')}</span>
              </Link>

              <div className="my-1 border-t border-border/60" />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false)
                  logout()
                }}
                className="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t('logout')}</span>
              </button>
            </>
          ) : (
            <>
              <div className="p-2 space-y-1.5">
                <Button
                  render={<Link to={`/${lang}/login`} />}
                  size="sm"
                  className="w-full text-xs font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {t('signIn')}
                </Button>
                <Button
                  render={<Link to={`/${lang}/register`} />}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {t('createAccount')}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
