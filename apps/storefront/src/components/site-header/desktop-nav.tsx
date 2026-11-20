import { Link, useLocation, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { getLocalizedNavLinks, getNavKey } from './nav-links'

export interface DesktopNavProps {
  isSearchOpen: boolean
  className?: string
}

export function DesktopNav({ isSearchOpen, className = '' }: DesktopNavProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const isAr = currentLang === 'ar'
  const location = useLocation()
  const { t } = useTranslation(['nav'])
  const links = getLocalizedNavLinks(currentLang)

  return (
    <nav
      aria-label="Global"
      style={{
        gap: 'var(--header-link-gap)',
        transitionProperty: 'opacity, transform',
        transitionDuration: 'var(--header-duration-fast, 200ms)',
        transitionTimingFunction: 'var(--header-ease)',
        transform: isSearchOpen
          ? isAr
            ? 'translateX(8px)'
            : 'translateX(-8px)'
          : 'translateX(0)',
      }}
      className={`hidden lg:flex flex-1 items-center justify-center transition-all ${
        isSearchOpen
          ? 'pointer-events-none opacity-0 invisible'
          : 'opacity-100 visible'
      } ${className}`}
    >
      {links.map((link) => {
        const currentPathAndSearch = location.pathname + location.search
        const isActive = link.href.includes('?')
          ? currentPathAndSearch === link.href
          : location.pathname === link.href && !location.search

        return (
          <Link
            key={link.id}
            to={link.href}
            className={`cursor-pointer whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              isAr
                ? 'text-[13px] leading-[1.7] tracking-normal'
                : 'text-[12px] leading-none tracking-[-0.01em]'
            } ${
              isActive
                ? 'font-medium text-foreground'
                : 'text-foreground/80 hover:text-foreground'
            }`}
          >
            {t(getNavKey(link.labelKey), { ns: 'nav', defaultValue: link.id })}
          </Link>
        )
      })}
    </nav>
  )
}
