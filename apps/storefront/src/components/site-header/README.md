# site-header

## Overview

Apple.com-style sticky global navigation bar for the Muftahy storefront. Manages four mutually-exclusive panel states (idle, search open, mobile menu open, cart open) using an `IntersectionObserver` sentinel for scroll-border detection instead of scroll event listeners. Renders a `DesktopNav` center links bar, a `SearchPanel` takeover, a `CartButton` with inline dropdown (desktop) and Sheet (mobile), and a `MenuToggle` hamburger-to-X button.

## Interface

- `SiteHeader(props: SiteHeaderProps)` — root header orchestrator. Props:
  - `logo?: ReactNode` — custom logo node (defaults to `SiteLogo`).
  - `endActions?: ReactNode` — additional desktop-only actions rendered before search/cart.
  - `sticky?: boolean` — enables `position: sticky; top: 0` (default: `true`, from config).
  - `className?: string`
  - `sentinelId?: string` — ID of the DOM scroll sentinel (default: `'nav-sentinel'`).
- `SiteHeaderProps` — interface for the above.
- `HeaderNavLink` — `{ id, labelKey: 'nav.${NavKey}', href, children?: HeaderNavLink[], isPlaceholder?: boolean }`.
- `NavKey` — `'allProducts' | 'products' | 'windows' | 'office' | 'games' | 'software' | 'giftCards' | 'subscriptions' | 'deals'`.
- `SiteHeaderConfig` — `{ sticky, searchEnabled, mobileBreakpoint, quickLinksSource, navLinks }`.
- `SITE_HEADER_CONFIG: SiteHeaderConfig` — the config singleton from `site-header.config.ts`.
- `getLocalizedNavLinks(lang: string): HeaderNavLink[]` — prepends the active `/:lang` prefix to all nav link hrefs.
- `getNavKey(labelKey: string): NavKey` — strips `'nav.'` prefix for i18n `t()` lookup.
- `SiteLogo(props: SiteLogoProps)` — logo link (key SVG mark + wordmark) pointing to `/:lang`.
- `DesktopNav(props: DesktopNavProps)` — hidden on mobile (`lg:flex`); renders localized nav links with active-route styling.
- `MobileMenu(props: MobileMenuProps)` — full-screen overlay panel for mobile navigation; closes on route change, Escape, or viewport ≥ 1024px.
- `SearchPanel(props: SearchPanelProps)` — search trigger button + full-page (mobile) / 400px dropdown (desktop) search sheet with live product results via `useProducts`.
- `CartButton(props: CartButtonProps)` — shopping bag icon button; supports controlled and uncontrolled open state. Desktop: custom dropdown. Mobile: shadcn `Sheet` sliding from the RTL-aware side.
- `MenuToggle(props: MenuToggleProps)` — hamburger-to-X animated toggle, `lg:hidden`.

## Developer Guide

### Design Tokens

All dimensions and motion values are CSS custom properties in `src/index.css`:

```css
--header-height: 44px;              /* Desktop bar height */
--header-height-mobile: 48px;       /* Mobile bar height */
--header-max-width: var(--site-max-width, 1280px); /* Unified container max-width */
--header-inline-padding: var(--site-padding-desktop, 2rem); /* Desktop padding (32px) */
--header-inline-padding-mobile: var(--site-padding-mobile, 1rem); /* Mobile padding (16px) */
--header-blur: 20px;                /* Backdrop blur radius */
--header-duration-fast: 150ms;
--header-duration-base: 300ms;
--header-duration-menu: 240ms;
--header-ease: cubic-bezier(0.4, 0, 0.6, 1);
```

### Changing Navigation Links

Edit `site-header.config.ts`. Each link's `href` is automatically prefixed with `/:lang` by `getLocalizedNavLinks`.

### Swapping the Logo

Pass `logo={<YourLogo />}` to `<SiteHeader>`, or edit `site-logo.tsx` directly.

### Disabling Sticky

Set `sticky={false}` on `<SiteHeader>` or change `sticky: false` in `site-header.config.ts`.

### Adding Desktop Actions

Use the `endActions` slot: `<SiteHeader endActions={<UserAccountMenu />} />`.

### Future Flyout Menus

`HeaderNavLink.children` is reserved for nested flyout links. Populate in config and add trigger logic in `desktop-nav.tsx`.

## Invariants

- `[site-header.tsx:activePanel]` At most one panel (search, mobile menu, cart) is open at any time; opening one closes all others.
- `[mobile-menu.tsx:data-header-locked]` `MobileMenu` locks body scroll (`data-header-locked` attribute on `document.body`) while open; cleanup is guaranteed via effect return.
- `[search-panel.tsx:useProducts]` `SearchPanel` calls `useProducts` only when `isOpen && query.trim().length > 0`.
- `[site-header.tsx:IntersectionObserver]` The scroll-border state is driven by `IntersectionObserver` on `#nav-sentinel` (a 1px sentinel placed above the header in `RootLayout`), not a scroll listener.
- `[site-header.tsx:rtl]` Direction-sensitive icons (arrows, chevrons) use `rtl:rotate-180` for RTL-aware flipping.
- `[cart-button.tsx:formatMoneyFromMinor]` Cart prices are formatted through `formatMoneyFromMinor` from `@workspace/domain`; no inline currency concatenation.

## Side Effects

- `[mobile-menu.tsx:document.body]` and `[search-panel.tsx:document.body]`: set/remove `data-header-locked` attribute on `document.body` while open (used by CSS to prevent body scroll).
- `[search-panel.tsx:useProducts]`: triggers a TanStack Query fetch for live product search results.
- `[cart-button.tsx:useCartStore]`: reads `useCartStore` for item count and subtotal; no store mutations.
- `[site-header.tsx:IntersectionObserver]`: attaches an `IntersectionObserver` to `#nav-sentinel` on mount.

## Verification

- Run: `pnpm test`
