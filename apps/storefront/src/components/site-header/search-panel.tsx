import * as React from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useProducts } from '../../features/products/hooks/use-products'
import { getLocalizedNavLinks, getNavKey } from './nav-links'

export interface SearchPanelProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function SearchPanel({
  isOpen,
  onOpen,
  onClose,
  inputRef: externalInputRef,
}: SearchPanelProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation(['header', 'nav', 'common'])

  const [query, setQuery] = React.useState('')
  const localInputRef = React.useRef<HTMLInputElement | null>(null)
  const inputRef = externalInputRef || localInputRef
  const sheetRef = React.useRef<HTMLDivElement | null>(null)

  // Live products matching query through the service layer
  const { data: liveResults = [] } = useProducts(
    isOpen && query.trim().length > 0 ? { search: query.trim() } : undefined,
  )

  // Quick links derived from nav links
  const quickLinks = React.useMemo(() => getLocalizedNavLinks(currentLang), [currentLang])

  // Close on route change
  React.useEffect(() => {
    if (isOpen) {
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])

  // Auto-focus when opened & handle body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.setAttribute('data-header-locked', 'true')
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => {
        clearTimeout(timer)
        document.body.removeAttribute('data-header-locked')
      }
    }
  }, [isOpen, inputRef])

  // Esc key closes search takeover
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

  // Click outside the 400px search sheet on desktop to close
  React.useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (
        (sheetRef.current && sheetRef.current.contains(target)) ||
        target?.closest?.('header')
      ) {
        return
      }
      onClose()
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 10)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onClose()
      navigate(`/${currentLang}/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const handleLinkClick = () => {
    onClose()
  }

  return (
    <>
      {/* 1 ── Header In-Bar Search Trigger */}
      <button
        type="button"
        onClick={isOpen ? onClose : onOpen}
        aria-label={isOpen ? t('closeSearch', { ns: 'header' }) : t('search', { ns: 'header' })}
        aria-expanded={isOpen}
        aria-controls="search-sheet"
        className={`cursor-pointer relative z-40 inline-flex h-11 w-11 lg:w-9 items-center justify-center text-foreground/80 transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-opacity duration-200 ${
          isOpen
            ? 'max-lg:invisible max-lg:opacity-0 max-lg:pointer-events-none max-lg:w-0 max-lg:overflow-hidden'
            : 'visible opacity-100'
        }`}
      >
        <svg
          aria-hidden="true"
          className={`h-[17px] w-[17px] transition-colors ${
            isOpen ? 'text-foreground' : 'text-foreground/80'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      {/* 2 ── Search Sheet (Full-page on mobile, exactly 400px on desktop) */}
      {isOpen && (
        <>
          <div
            ref={sheetRef}
            id="search-sheet"
            style={{
              transitionProperty: 'opacity, transform',
              transitionDuration: 'var(--header-duration-base, 300ms)',
              transitionTimingFunction: 'var(--header-ease)',
            }}
            className="fixed inset-x-0 z-40 bg-background overflow-y-auto border-b border-border/40 shadow-md bottom-0 lg:bottom-auto top-[var(--header-height-mobile,48px)] lg:top-[var(--header-height,44px)] lg:h-[400px] animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col"
          >
            <div className="site-container py-6 flex-1 flex flex-col space-y-6 text-start">
              {/* Completely Borderless Search Input Field */}
              <form onSubmit={handleSubmit} className="relative w-full">
                <div className="flex items-center gap-2.5 w-full border-b border-border/20 pb-3">
                  {/* Persistent Search Icon at Far Left / Start */}
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-foreground/70"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>

                  {/* Input with 0 padding-start so cursor appears directly next to search icon */}
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('searchPlaceholder', { ns: 'header' })}
                    aria-label={t('search', { ns: 'header' })}
                    className="flex-1 bg-transparent p-0 border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 shadow-none text-base md:text-lg font-medium text-foreground placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none"
                  />

                  {/* Clear Preset: Rounded filled button with knockout X */}
                  {query.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      aria-label={t('clear', { ns: 'common', defaultValue: 'Clear' })}
                      className="group cursor-pointer shrink-0 rounded-full transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 transition-colors"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          className="fill-muted-foreground/40 group-hover:fill-muted-foreground/60 transition-colors"
                        />
                        <path
                          d="m15 9-6 6M9 9l6 6"
                          className="stroke-background"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </form>

              {/* Search Content: Live Results or Quick Links */}
              {query.trim().length > 0 ? (
                // Live Search Results
                <div className="space-y-3 flex-1 overflow-y-auto">
                  <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    {t('title', { ns: 'search' })}
                  </span>
                  {liveResults && liveResults.length > 0 ? (
                    <ul className="space-y-1">
                      {liveResults.map((prod) => (
                        <li key={prod.id}>
                          <Link
                            to={`/${currentLang}/products/${prod.id}`}
                            onClick={handleLinkClick}
                            className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-secondary/60 text-sm text-foreground/90 hover:text-foreground transition-colors group"
                          >
                            <span>{prod.name}</span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {prod.effective_price} EGP
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">
                      {t('noResults', { ns: 'search', query })}
                    </p>
                  )}
                </div>
              ) : (
                // Quick Links Section directly underneath
                <div className="space-y-3 flex-1 overflow-y-auto">
                  <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    {t('quickLinks', { ns: 'header' })}
                  </span>
                  <ul className="space-y-2">
                    {quickLinks.map((link, index) => (
                      <li
                        key={link.id}
                        style={{
                          animation: 'header-fade-in var(--header-duration-base, 300ms) var(--header-ease) both',
                          animationDelay: `${index * 35}ms`,
                        }}
                      >
                        <Link
                          to={link.href}
                          onClick={handleLinkClick}
                          className="cursor-pointer inline-flex items-center gap-2 text-sm md:text-base text-foreground/80 hover:text-foreground transition-colors group py-1"
                        >
                          {/* Direction-aware arrow icon (flips in RTL) */}
                          <svg
                            aria-hidden="true"
                            className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                          <span>{t(getNavKey(link.labelKey), { ns: 'nav', defaultValue: link.id })}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 3 ── Desktop Background Subtle Blur Overlay (Below the 400px dropdown) */}
          <div
            aria-hidden="true"
            onClick={onClose}
            className="hidden lg:block fixed inset-x-0 bottom-0 top-[calc(var(--header-height,44px)+400px)] z-30 bg-background/20 backdrop-blur-xs transition-opacity duration-300"
          />
        </>
      )}
    </>
  )
}
