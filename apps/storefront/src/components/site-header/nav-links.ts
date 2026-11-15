import {
  SITE_HEADER_CONFIG,
  type HeaderNavLink,
  type NavKey,
} from './site-header.config'

export function getNavKey(labelKey: string): NavKey {
  return labelKey.replace('nav.', '') as NavKey
}

export function getLocalizedNavLinks(lang: string): HeaderNavLink[] {
  return SITE_HEADER_CONFIG.navLinks.map((link) => ({
    ...link,
    href: link.href.startsWith('/') ? `/${lang}${link.href}` : `/${lang}/${link.href}`,
  }))
}
