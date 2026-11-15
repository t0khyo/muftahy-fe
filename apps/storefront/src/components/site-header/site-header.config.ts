export type NavKey =
  | 'games'
  | 'software'
  | 'giftCards'
  | 'subscriptions'
  | 'deals'

export interface HeaderNavLink {
  id: string
  labelKey: `nav.${NavKey}`
  href: string
  /** Optional nested links for future flyout menus */
  children?: HeaderNavLink[]
  /** Indicates placeholder status for customizable clone base */
  isPlaceholder?: boolean
}

export interface SiteHeaderConfig {
  sticky: boolean
  searchEnabled: boolean
  mobileBreakpoint: 'lg'
  quickLinksSource: 'navLinks'
  navLinks: HeaderNavLink[]
}

export const SITE_HEADER_CONFIG: SiteHeaderConfig = {
  sticky: true,
  searchEnabled: true,
  mobileBreakpoint: 'lg',
  quickLinksSource: 'navLinks',
  navLinks: [
    {
      id: 'games',
      labelKey: 'nav.games',
      href: '/products?category=games',
      isPlaceholder: true,
    },
    {
      id: 'software',
      labelKey: 'nav.software',
      href: '/products?category=software',
      isPlaceholder: true,
    },
    {
      id: 'gift-cards',
      labelKey: 'nav.giftCards',
      href: '/products?category=gift-cards',
      isPlaceholder: true,
    },
    {
      id: 'subscriptions',
      labelKey: 'nav.subscriptions',
      href: '/products?category=subscriptions',
      isPlaceholder: true,
    },
    {
      id: 'deals',
      labelKey: 'nav.deals',
      href: '/products?deals=true',
      isPlaceholder: true,
    },
  ],
}
