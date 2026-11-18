import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { AccountDropdown } from './account-dropdown'
import { CartButton } from './cart-button'
import { DesktopNav } from './desktop-nav'
import { MenuToggle } from './menu-toggle'
import { MobileMenu } from './mobile-menu'
import { SearchPanel } from './search-panel'
import { SITE_HEADER_CONFIG } from './site-header.config'
import { SiteLogo } from './site-logo'

export interface SiteHeaderProps {
  /** Custom logo node (defaults to placeholder Key + Wordmark) */
  logo?: React.ReactNode
  /** Additional actions rendered before search & cart on desktop */
  endActions?: React.ReactNode
  /** Whether the header remains sticky at top of viewport */
  sticky?: boolean
  /** Additional container classes */
  className?: string
  /** Sentinel ID for IntersectionObserver scroll detection (defaults to 'nav-sentinel') */
  sentinelId?: string
}

export function SiteHeader({
  logo,
  endActions,
  sticky = SITE_HEADER_CONFIG.sticky,
  className = '',
  sentinelId = 'nav-sentinel',
}: SiteHeaderProps) {
  const { t } = useTranslation(['header'])
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isCartOpen, setIsCartOpen] = React.useState(false)
  const searchClosedAtRef = React.useRef(0)

  const isAnyPanelOpen = isMobileMenuOpen || isSearchOpen || isCartOpen

  // IntersectionObserver to detect scroll position without scroll listeners
  React.useEffect(() => {
    const sentinel = document.getElementById(sentinelId)
    if (!sentinel || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting)
      },
      { root: null, threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinelId])

  // Mutually exclusive panel handlers (Apple-style coordination)
  const handleOpenSearch = React.useCallback(() => {
    setIsMobileMenuOpen(false)
    setIsCartOpen(false)
    setIsSearchOpen(true)
  }, [])

  const handleCloseSearch = React.useCallback(() => {
    searchClosedAtRef.current = Date.now()
    setIsSearchOpen(false)
  }, [])

  const handleToggleMobileMenu = React.useCallback(() => {
    // Prevent immediate re-trigger if search was just closed (guards against touch/mousedown event races)
    if (Date.now() - searchClosedAtRef.current < 400) {
      return
    }
    setIsSearchOpen(false)
    setIsCartOpen(false)
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  const handleCloseMobileMenu = React.useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  const handleMenuToggleClick = React.useCallback(() => {
    if (isSearchOpen) {
      handleCloseSearch()
    } else {
      handleToggleMobileMenu()
    }
  }, [isSearchOpen, handleCloseSearch, handleToggleMobileMenu])

  const handleToggleCart = React.useCallback(() => {
    setIsSearchOpen(false)
    setIsMobileMenuOpen(false)
    setIsCartOpen((prev) => !prev)
  }, [])

  const handleCloseCart = React.useCallback(() => {
    setIsCartOpen(false)
  }, [])

  return (
    <>
      {/* Skip to Content Accessible Link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-1.5 focus:text-primary-foreground focus:shadow-md focus:outline-none"
      >
        {t('skipToContent', { ns: 'header' })}
      </a>

      {/* Main Header Landmark */}
      <header
        aria-label="Site Header"
        style={{
          transitionProperty: 'border-color, background-color',
          transitionDuration: 'var(--header-duration-fast, 200ms)',
          transitionTimingFunction: 'var(--header-ease)',
        }}
        className={`w-full z-40 ${
          isAnyPanelOpen ? 'bg-background' : isScrolled ? 'header-glass' : 'bg-background'
        } ${
          sticky ? 'sticky top-0' : 'relative'
        } ${
          isScrolled ? 'border-b border-border/40' : 'border-b border-transparent'
        } ${className}`}
      >
        <div className="site-container flex h-[var(--header-height-mobile,48px)] lg:h-[var(--header-height,44px)] items-center justify-between">
          {/* 1 ── Start: Logo (Hidden on mobile when search or menu is open; visible on desktop) */}
          <div
            className={`flex shrink-0 items-center transition-opacity duration-200 ${
              isMobileMenuOpen
                ? 'invisible opacity-0 pointer-events-none'
                : isSearchOpen
                  ? 'max-lg:invisible max-lg:opacity-0 max-lg:pointer-events-none'
                  : 'visible opacity-100'
            }`}
          >
            {logo ?? <SiteLogo />}
          </div>

          {/* 2 ── Center: Desktop Navigation Links (Always visible on desktop) */}
          <div className={isMobileMenuOpen ? 'hidden' : 'contents'}>
            <DesktopNav isSearchOpen={false} />
          </div>

          {/* 3 ── End: Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Optional EndActions slot on Desktop */}
            {endActions && !isMobileMenuOpen && (
              <div className="hidden lg:flex items-center me-1">
                {endActions}
              </div>
            )}

            {/* Search Trigger & Panel */}
            {SITE_HEADER_CONFIG.searchEnabled && !isMobileMenuOpen && (
              <div className="inline-flex">
                <SearchPanel
                  isOpen={isSearchOpen}
                  onOpen={handleOpenSearch}
                  onClose={handleCloseSearch}
                />
              </div>
            )}

            {/* Account Dropdown */}
            {!isMobileMenuOpen && (
              <div
                className={`inline-flex transition-opacity duration-200 ${
                  isSearchOpen
                    ? 'max-lg:invisible max-lg:opacity-0 max-lg:pointer-events-none max-lg:w-0 max-lg:overflow-hidden'
                    : 'visible opacity-100'
                }`}
              >
                <AccountDropdown />
              </div>
            )}

            {/* Cart Button (Hidden on mobile when search or menu is open; visible on desktop) */}
            {!isMobileMenuOpen && (
              <div
                className={`inline-flex transition-opacity duration-200 ${
                  isSearchOpen
                    ? 'max-lg:invisible max-lg:opacity-0 max-lg:pointer-events-none max-lg:w-0 max-lg:overflow-hidden'
                    : 'visible opacity-100'
                }`}
              >
                <CartButton
                  isOpen={isCartOpen}
                  onToggle={handleToggleCart}
                  onClose={handleCloseCart}
                />
              </div>
            )}

            {/* Mobile Menu Hamburger: Always handles the animated open/close motion on mobile */}
            <div className="lg:hidden">
              <MenuToggle
                isOpen={isMobileMenuOpen || isSearchOpen}
                onToggle={handleMenuToggleClick}
                controlsId={isSearchOpen ? 'search-sheet' : 'mobile-menu'}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay / Panel */}
      <MobileMenu
        id="mobile-menu"
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
      />
    </>
  )
}
