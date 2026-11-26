export type NavKey =
  | "allProducts"
  | "products"
  | "windows"
  | "office"
  | "games"
  | "software"
  | "giftCards"
  | "subscriptions"
  | "deals"

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
  mobileBreakpoint: "lg"
  quickLinksSource: "navLinks"
  navLinks: HeaderNavLink[]
}

export const SITE_HEADER_CONFIG: SiteHeaderConfig = {
  sticky: true,
  searchEnabled: true,
  mobileBreakpoint: "lg",
  quickLinksSource: "navLinks",
  navLinks: [
    {
      id: "all-products",
      labelKey: "nav.allProducts",
      href: "/products",
    },
    {
      id: "windows",
      labelKey: "nav.windows",
      href: "/products?category=operating-systems",
    },
    {
      id: "office",
      labelKey: "nav.office",
      href: "/products?category=office-suites",
    },
  ],
}
