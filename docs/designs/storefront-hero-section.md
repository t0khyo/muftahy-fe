# Storefront Home Page HeroSection Architecture

- **Author:** Abdelrahman Eltokhy
- **Status:** Approved
- **Date:** 2026-11-15

---

## Overview

The Storefront Home Page HeroSection is the primary landing view for the Muftahy digital marketplace. It introduces the brand value proposition, presents key value propositions and trust claims for digital goods, and directs visitors to explore genuine game codes, software licenses, and subscription products. The section is built using semantic Tailwind design tokens, existing shadcn/Base UI component primitives, and complete bidirectional Arabic (RTL) and English (LTR) internationalization.

## Problem Statement

Digital keys, activation codes, and software licenses are non-physical goods that suffer from high consumer skepticism in the Middle East and GCC regions regarding authenticity, prompt delivery, and activation validity. When visitors arrive at the storefront:

1. If the landing section is overloaded with redundant search boxes, extensive category grids, or heavy media carousels, it creates cognitive clutter and distracts from browsing products.
2. If trust indicators are missing or repeated identically across multiple stacked sections, first-time shoppers encounter redundant messaging without gain in confidence.
3. If translation keys, visual art paths, and route targets are hardcoded directly within presentation templates, marketing teams cannot adapt seasonal campaigns without modifying UI source code.

The storefront requires a lean, high-clarity HeroSection driven by an explicit configuration schema in `home.config.ts`, displaying verified value propositions without invented numerical metrics, and delivering immediate catalog discovery across mobile and desktop viewports.

## Goals & Non-Goals

### Goals

- **Primary Action Controls**: Focus the HeroSection on one core outcome: guiding the visitor into the product catalog via a clear 1:1 action pair (primary button and secondary text link).
- **Explicit, Backward-Compatible Schema**: Support optional configuration fields (`badgeKey`, `badgeHref`, `trustClaims`) in `HeroSectionConfig` with guaranteed fallback defaults to existing convention keys.
- **Inline Trust Claims Row**: Provide an inline, non-heading trust claims row (`Instant Delivery • Verified Licenses • Activation Support`) directly framing the call to action, avoiding card duplication.
- **Deduplicated Landing Experience**: Set `enabled: false` on the downstream `trust-strip` section in `DEFAULT_HOME_CONFIG` by default, retaining its registry entry and translation keys for future re-activation with differentiated content (refund policies, payment methods, support hours).
- **Stable Visual Placeholder Surface**: Build the visual asset slot with a fixed aspect-ratio container (`aspect-16/9 sm:aspect-21/9`), neutral [BrandLogoMark](file:///home/abdelrahman/dev/muftahy-fe/apps/storefront/src/components/brand-logo.tsx) placeholder for development with localized accessible label (`hero.visualAlt`), preventing Cumulative Layout Shift (CLS). Production WebP image integration is deferred to a future asset-drop milestone.
- **Configurable Seasonal Announcement Badge**: Support an optional seasonal announcement badge (`Badge`) that renders only when configured and verified to exist in active i18n dictionaries, supporting accessible link navigation (minimum 44px tap target) when `badgeHref` is specified.
- **Layout Stability & Full Bidirectional Symmetry**: Enforce reserved aspect-ratio geometry, logical CSS spacing properties (`ms-*`, `me-*`, `ps-*`, `pe-*`), and dark/light mode token compliance.

### Non-Goals

- **No Embedded Search Input**: The global sticky header already owns search; the Hero will not provide a secondary search input.
- **No Product Preview Carousels or Cards**: Product browsing is owned by subsequent featured collection rails (`product-rail`).
- **No Redundant Category Chips**: Category navigation is handled by the immediate downstream `category-tiles` section.
- **No Fabricated Numerical Metrics**: No unbacked claims (such as "10,000+ happy gamers") without actual backend tracking.
- **No External CMS or Database Dependency**: `home.config.ts` remains a typed TypeScript configuration within the repository.
- **No Speculative Client-Side Asset Pipelines**: No multi-variant asset loaders or runtime theme-switch subsystems for assets not yet in the repository.
- **No New Dependencies or Animation Libraries**: All transitions and layout styling rely strictly on native CSS and Tailwind utility tokens.

## Resolved Design Decisions

- **Decision 1: `trust-strip` Coexistence**:
  - _Resolution_: The downstream `trust-strip` is set to `enabled: false` by default in `DEFAULT_HOME_CONFIG`. Its component, configuration schema, and translation keys are fully preserved in the codebase, available for future re-enabling when differentiated post-catalog guarantees (refund policies, payment gateway icons, support operating hours) are introduced.
- **Decision 2: Key Art Integration Milestone**:
  - _Resolution_: Development is not blocked on final artwork. [BrandLogoMark](file:///home/abdelrahman/dev/muftahy-fe/apps/storefront/src/components/brand-logo.tsx) serves as the development placeholder. The visual container is architected with a responsive fixed aspect ratio (`aspect-16/9 sm:aspect-21/9`) to allow dropping in production WebP assets in a future milestone without DOM or layout restructuring. Speculative asset-switching unions are excluded.

## Critical User Journeys (CUJs)

### CUJ 1: First-Time Visitor Discovers Catalog

- **Given**: An unregistered visitor arrives at `/:lang` (e.g. `/ar` or `/en`) on mobile or desktop in either light or dark mode.
- **When**: The visitor views the hero headline ("All your digital products at fair prices"), reads the trust claims ("Instant Delivery • Authentic Licenses • Activation Support"), and clicks the primary CTA button ("Browse Products" / "تصفح المنتجات").
- **Then**: The application navigates to `/:lang/products`, preserving locale and theme without page reload or layout shift, and without immediately encountering duplicate trust cards below the hero.

### CUJ 2: Seasonal Campaign Engagement

- **Given**: A seasonal promotion is active (e.g. White Friday) with `badgeKey` and `badgeHref` defined in `home.config.ts`.
- **When**: The visitor views the pill badge above the headline and taps it.
- **Then**: The application navigates to the promotional target route, with the chevron icon correctly oriented according to text direction (`rtl:rotate-180` in Arabic).

### CUJ 3: Missing or Fallback Translation Key Graceful Degradation

- **Given**: A developer specifies an optional `badgeKey` that has not yet been translated in `ar.json`.
- **When**: An Arabic user loads `/ar`.
- **Then**: The missing key existence guard evaluates existence strictly against the active language without fallback (`i18n.exists('home:' + config.badgeKey, { lng: currentLang, fallbackLng: false })`), suppressing the badge and preventing English copy leakage on Arabic pages.

---

## Proposed Architecture

### 1. High-Level Data Flow & Architecture

```mermaid
flowchart TD
    subgraph ConfigLayer["Configuration Layer (home.config.ts)"]
        DHC["DEFAULT_HOME_CONFIG"] --> HSC["HeroSectionConfig"]
        HSC --> BK["badgeKey? / badgeHref?"]
        HSC --> TC["trustClaims? (DEFAULT_HERO_TRUST_CLAIMS)"]
        DHC --> TSC["TrustStripSectionConfig (enabled: false)"]
    end

    subgraph PresentationLayer["Presentation Layer (features/home)"]
        HP["HomePage (home-page.tsx)"] --> HS["HeroSection (hero-section.tsx)"]
        HS --> BUI["shadcn Badge (variant='secondary')"]
        HS --> BTN["shadcn Button (variant='default')"]
        HS --> HI["HeroIcons (ZapIcon, ShieldCheckIcon, HeadphonesIcon, ChevronEndIcon)"]
        HS --> BLM["BrandLogoMark (aspect-16/9 sm:aspect-21/9)"]
        HS --> RLH["resolveLocaleHref()"]
    end

    subgraph i18nLayer["Localization Layer (packages/i18n)"]
        HS -.->|t('hero.*')| I18N["react-i18next (en.json / ar.json)"]
    end
```

### 2. Configuration Schema & Types (`home.config.ts`)

`HeroSectionConfig` extends `BaseSectionConfig` (defined in [home.config.ts](file:///home/abdelrahman/dev/muftahy-fe/apps/storefront/src/features/home/home.config.ts)) and maintains full backward compatibility by keeping optional fields while relying on stable convention translation keys:

```typescript
export interface HeroTrustClaim {
  id: string
  icon: 'zap' | 'shield-check' | 'headphones'
  labelKey: string
}

export const DEFAULT_HERO_TRUST_CLAIMS: HeroTrustClaim[] = [
  { id: 'instant-delivery', icon: 'zap', labelKey: 'hero.trustInstant' },
  { id: 'verified-licenses', icon: 'shield-check', labelKey: 'hero.trustVerified' },
  { id: 'support', icon: 'headphones', labelKey: 'hero.trustSupport' },
]

export interface HeroSectionConfig extends BaseSectionConfig {
  type: 'hero'
  primaryCtaHref: string     // Target route, e.g. '/:lang/products'
  secondaryCtaHref: string   // Target route, e.g. '/:lang/how-it-works'
  badgeKey?: string          // Optional seasonal badge copy key, e.g. 'hero.seasonalBadge'
  badgeHref?: string         // Optional seasonal badge link, e.g. '/:lang/deals'
  trustClaims?: HeroTrustClaim[]
}
```

#### Default Configuration (`DEFAULT_HOME_CONFIG`)

```typescript
{
  id: 'hero',
  type: 'hero',
  enabled: true,
  primaryCtaHref: '/:lang/products',
  secondaryCtaHref: '/:lang/how-it-works',
  trustClaims: DEFAULT_HERO_TRUST_CLAIMS,
}
```

The downstream `trust-strip` in `DEFAULT_HOME_CONFIG` is set to `enabled: false`:

```typescript
{
  id: 'trust',
  type: 'trust-strip',
  enabled: false, // Disabled to prevent duplicate claims directly under the hero
  items: [...],
}
```

### 3. Route Normalization Helper (`features/home/lib/resolve-locale-href.ts`)

A pure, idempotent route normalization helper handles parameterized templates, pre-localized paths, and external protocols safely:

```typescript
export function resolveLocaleHref(href: string, lang: string): string {
  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
    return href
  }

  if (href.includes(':lang')) {
    return href.replace(':lang', lang)
  }

  if (href.startsWith(`/${lang}/`) || href === `/${lang}`) {
    return href
  }

  const cleanPath = href.startsWith('/') ? href : `/${href}`
  return `/${lang}${cleanPath}`
}
```

### 4. Local SVG Icons Helper (`features/home/components/hero-icons.tsx`)

Because `lucide-react` is not a direct dependency of `apps/storefront` and workspace package boundaries forbid ad-hoc package modifications, `hero-icons.tsx` provides inline SVG components reusing proven geometries from [trust-strip.tsx](file:///home/abdelrahman/dev/muftahy-fe/apps/storefront/src/features/home/components/trust-strip.tsx) and [category-tiles.tsx](file:///home/abdelrahman/dev/muftahy-fe/apps/storefront/src/features/home/components/category-tiles.tsx):

```typescript
import type { SVGProps } from 'react'

export function ZapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function HeadphonesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  )
}

export function ChevronEndIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
```

### 5. HeroSection Component Architecture (`hero-section.tsx`)

Composed strictly of existing shadcn/Base UI primitives and semantic tokens:

1.  **Announcement Pill Slot**:
    - Rendered only if `config.badgeKey` is defined AND `i18n.exists('home:' + config.badgeKey, { lng: currentLang, fallbackLng: false })`.
    - If `config.badgeHref` is provided: wrapped in a flex container ensuring a minimum 44px tap target (`min-h-11 inline-flex items-center`), rendering shadcn `Badge` with `variant="secondary"` using Base UI `render={<Link to={resolveLocaleHref(config.badgeHref, currentLang)} />}` and trailing `<ChevronEndIcon className="size-3 rtl:rotate-180" />`.
    - If `badgeHref` is omitted: renders as a static semantic `Badge` (`variant="secondary"`) with `role="status"`.
2.  **Typographic Core**:
    - Exactly one `<h1>` per page, styled with `text-h1 font-bold text-foreground ltr:tracking-tight text-balance`. Does not apply letter-spacing to Arabic script, and relies on design system line-height tokens (1.4 for Arabic, 1.2 for Latin).
    - Subtitle paragraph, styled with `text-body text-muted-foreground text-balance max-w-xl mx-auto`.
3.  **Action Controls**:
    - Primary CTA: shadcn `Button` (`size="lg"`, `variant="default"`, `className="rounded-full px-8 font-semibold"`, `nativeButton={false}`) using Base UI `render={<Link to={resolveLocaleHref(config.primaryCtaHref, currentLang)} />}` rendering `{t('hero.primaryCta', { ns: 'home' })}`.
    - Secondary Link: `<Link to={resolveLocaleHref(config.secondaryCtaHref, currentLang)} className="min-h-11 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline px-3">{t('hero.secondaryCta', { ns: 'home' })}</Link>`.
4.  **Trust Claims Row**:
    - Rendered as `<ul role="list" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2">`.
    - Maps `config.trustClaims ?? DEFAULT_HERO_TRUST_CLAIMS` via `const ICON_MAP = { zap: ZapIcon, 'shield-check': ShieldCheckIcon, headphones: HeadphonesIcon } as const`.
    - Each `<li>` renders an inline flex container with the matching icon (`size-3.5 text-muted-foreground/80`) and claim text (`text-xs font-medium text-muted-foreground`).
5.  **Visual Surface Slot**:
    - Fixed responsive aspect ratio (`aspect-16/9 sm:aspect-21/9`), `w-full max-w-[1024px] overflow-hidden rounded-3xl border border-border/50 bg-muted/20`.
    - Renders [BrandLogoMark](file:///home/abdelrahman/dev/muftahy-fe/apps/storefront/src/components/brand-logo.tsx) centered with responsive scaling, accompanied by an adjacent visually hidden span `<span className="sr-only">{t('hero.visualAlt', { ns: 'home' })}</span>` providing localized accessibility text.

### 6. Localization Parity (`en.json` & `ar.json`)

Updates applied to both locale files under the `home` namespace, preserving existing keys:

```json
{
  "hero": {
    "title": "All your digital products at fair prices.",
    "subtitle": "Original software, subscriptions, and game codes, delivered instantly with activation support.",
    "primaryCta": "Browse Products",
    "secondaryCta": "Learn How It Works",
    "visualAlt": "Marketplace visual preview",
    "trustInstant": "Instant Delivery",
    "trustVerified": "Verified Licenses",
    "trustSupport": "Activation Support",
    "seasonalBadge": "Ramadan Deals • Up to 50% Off"
  }
}
```

```json
{
  "hero": {
    "title": "كل منتجاتك الرقمية بأسعار معقولة",
    "subtitle": "برامج واشتراكات وأكواد ألعاب أصلية، تصلك فورًا وبدعم يساعدك في التفعيل.",
    "primaryCta": "تصفح المنتجات",
    "secondaryCta": "كيف تتم عملية الشراء",
    "visualAlt": "معاينة بصرية للسوق",
    "trustInstant": "تسليم فوري",
    "trustVerified": "تراخيص أصلية معتمدة",
    "trustSupport": "دعم فني سريع",
    "seasonalBadge": "عروض رمضان • خصومات تصل إلى 50%"
  }
}
```

---

## Alternatives Considered

### Alternative A: Embedded Full-Width Search Input in Hero

- **Pros**: Provides immediate search entry point without requiring users to interact with the header.
- **Cons**: Duplicates the global sticky header's expandable search panel; creates competing focus targets on page load; causes UI crowding above the fold; fragments search interaction telemetry.
- **Reason for Rejection**: The global sticky header already owns search across the entire application. Duplicating search in the hero introduces conflicting visual affordances and dilutes the single stated goal of driving visitors to browse the product catalog.

### Alternative B: Interactive Product Preview Cards in Hero

- **Pros**: Exposes actual discounted products and key prices immediately without scrolling.
- **Cons**: Forces pricing, plan pickers, and cart mutations directly into the hero; introduces layout clutter and heavy vertical height; duplicates the immediate downstream product rails.
- **Reason for Rejection**: Product browsing and plan selection are cleanly owned by subsequent collection rails (`product-rail`). Embedding interactive cards in the hero causes visual overcrowding and pushes category discovery offscreen.

### Alternative C: Retaining Active Standalone `trust-strip` Directly Below Hero

- **Pros**: Maximizes visible trust content on the landing view.
- **Cons**: Repeats identical claims (instant delivery, authentic licenses, customer support) back-to-back within the first two viewport heights, causing message fatigue and pushing product rails further down the page.
- **Reason for Rejection**: Presenting two consecutive trust sections with identical messaging creates visual and cognitive redundancy. Setting `trust-strip` to `enabled: false` by default cleans up the landing funnel while preserving the component for future differentiated trust content (refund policies, payment methods, support hours).

### Alternative D: Speculative Multi-Variant Key Art Pipeline

- **Pros**: Fully models client-side seasonal key art switching in advance.
- **Cons**: Introduces untested image loading and theme-switching frameworks for WebP assets that do not exist in the repository; violates YAGNI and design system guidelines.
- **Reason for Rejection**: `docs/design-system.md` explicitly specifies using neutral placeholders until production brand artwork is commissioned. Speculative asset loaders add code bloat without delivery value.

---

## Risks & Limits

1.  **Unlocalized Campaign Badge Rollout Risk**:
    - _Risk_: A marketing campaign specifies a new `badgeKey` that is translated in English but not yet authored in Arabic.
    - _Mitigation_: The component strictly evaluates existence using `i18n.exists('home:' + config.badgeKey, { lng: currentLang, fallbackLng: false })`. If the key is missing in the active language, the badge is suppressed rather than falling back to English on an Arabic page.
2.  **Navigation and Protocol Risk**:
    - _Risk_: External promotional links or anchor links placed in `primaryCtaHref`, `secondaryCtaHref`, or `badgeHref` could be malformed by naive locale prefixing.
    - _Mitigation_: `resolveLocaleHref` inspects prefixes, preserving external protocols (`http://`, `https://`, `mailto:`, `tel:`), hashes (`#`), and already-localized paths (`/${lang}/...`).
3.  **Layout Shift & Viewport Distortion Risk**:
    - _Risk_: Clamping containers with fluid max-widths and fixed heights distorts aspect ratios across mobile and ultra-wide viewports.
    - _Mitigation_: The visual container eliminates arbitrary height clamps, enforcing strict aspect ratios (`aspect-16/9 sm:aspect-21/9`) and `overflow-hidden`.
4.  **Development Placeholder Scope Limit**:
    - _Risk_: Stakeholders expect final production artwork upon initial merge.
    - _Mitigation_: The feature explicitly defines `BrandLogoMark` as the development placeholder. Full art drop-in will occur during a dedicated asset integration milestone before public launch.

---

## Non-Functional Requirements

### 1. Performance & Core Web Vitals

- **Cumulative Layout Shift**: The visual asset surface enforces strict aspect-ratio containers (`aspect-16/9 sm:aspect-21/9`), reserving geometry to prevent layout shifts.
- **Largest Contentful Paint (LCP)**: Development placeholder renders lightweight SVG; future artwork is constrained to WebP format under 250 KB with eager loading.
- **Zero Added Dependencies**: Zero new npm packages or animation libraries. All animations use standard Tailwind CSS classes respecting `prefers-reduced-motion`.

### 2. Accessibility (WCAG 2.1 AA)

- **Heading Structure**: Exactly one `<h1>` landmark per page. Trust claims are marked as an unordered list (`<ul role="list">`), not heading tags (`<h2>`/`<h3>`), preserving proper document outline.
- **Contrast Ratios**: Verified text contrast against background (>16:1 for primary foreground, >4.5:1 for muted text in both light and dark themes).
- **Touch Targets**: Both the secondary text link and the interactive announcement badge link enforce a minimum tap target of `min-h-11 inline-flex items-center` (44px) on mobile viewports.

### 3. Internationalization & Bidirectional Layout

- **Logical CSS Properties**: Directional spacing and layout strictly use `ms-*`, `me-*`, `ps-*`, `pe-*`, and `rtl:rotate-180` for directional chevrons. Physical direction classes (`ml-*`, `mr-*`, `pl-*`, `pr-*`) are prohibited.
- **Typography Compliance**: Arabic text adheres to `Tajawal` with 1.4 heading line-height and strictly zero letter-spacing (`ltr:tracking-tight` scoped to Latin only).
- **Western Digits**: Any currency or number rendering adheres to `Intl.NumberFormat` with `ar-u-nu-latn`.

---

## Detailed Implementation Plan

### Phase 1: Pure Helpers & Icons

#### 1. `apps/storefront/src/features/home/lib/resolve-locale-href.ts` (Create)

- **Action**: Create route normalization utility.
- **Implementation**:
  ```typescript
  export function resolveLocaleHref(href: string, lang: string): string {
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return href
    }
    if (href.includes(':lang')) {
      return href.replace(':lang', lang)
    }
    if (href.startsWith(`/${lang}/`) || href === `/${lang}`) {
      return href
    }
    return `/${lang}${href.startsWith('/') ? href : `/${href}`}`
  }
  ```

#### 2. `apps/storefront/src/features/home/lib/resolve-locale-href.test.ts` (Create)

- **Action**: Unit test suite for route normalization helper.
- **Test Cases**:
  - Returns external URLs unchanged (`https://example.com`).
  - Returns in-page anchor links unchanged (`#how-it-works`).
  - Returns `mailto:` and `tel:` links unchanged.
  - Replaces `:lang` token (`/:lang/products` -> `/en/products` and `/ar/products`).
  - Does not double-prefix already localized paths (`/en/products` with lang `en` -> `/en/products`).
  - Prefixes un-prefixed relative paths (`/products` -> `/en/products`).

#### 3. `apps/storefront/src/features/home/components/hero-icons.tsx` (Create)

- **Action**: Create inline SVG icons module with `aria-hidden="true"`, `size-4`, and `currentColor`.
- **Exports**: `ZapIcon`, `ShieldCheckIcon`, `HeadphonesIcon`, `ChevronEndIcon`.
- **Checkpoint**: `pnpm --filter storefront typecheck && pnpm --filter storefront test`

---

### Phase 2: Configuration & Locales

#### 4. `apps/storefront/src/features/home/home.config.ts` (Modify)

- **Action**: Export `HeroTrustClaim`, `DEFAULT_HERO_TRUST_CLAIMS`, update `HeroSectionConfig`, and update `DEFAULT_HOME_CONFIG`.
- **Changes**:
  - Export `HeroTrustClaim` interface: `{ id: string; icon: 'zap' | 'shield-check' | 'headphones'; labelKey: string }`.
  - Export `DEFAULT_HERO_TRUST_CLAIMS: HeroTrustClaim[]`.
  - Update `HeroSectionConfig` extending `BaseSectionConfig`:
    - `primaryCtaHref: string`
    - `secondaryCtaHref: string`
    - `badgeKey?: string`
    - `badgeHref?: string`
    - `trustClaims?: HeroTrustClaim[]`
  - Update `DEFAULT_HOME_CONFIG`:
    - `hero.trustClaims = DEFAULT_HERO_TRUST_CLAIMS`.
    - `trust-strip.enabled = false`.

#### 5. `packages/i18n/src/locales/en.json` & `ar.json` (Modify)

- **Action**: Update `home.hero` namespace while preserving existing keys (`primaryCta`, `secondaryCta`, `visualAlt`).
- **Keys**: `title`, `subtitle`, `primaryCta`, `secondaryCta`, `visualAlt`, `trustInstant`, `trustVerified`, `trustSupport`, `seasonalBadge`.
- **Checkpoint**: `pnpm typecheck`

---

### Phase 3: Component Architecture

#### 6. `apps/storefront/src/features/home/components/hero-section.tsx` (Modify)

- **Action**: Refactor `HeroSection` presentation component.
- **Implementation**:
  - Import `Badge` from `@workspace/ui/components/badge` and `Button` from `@workspace/ui/components/button`.
  - Import `BrandLogoMark` from `apps/storefront/src/components/brand-logo`.
  - Import icons from `./hero-icons` and `resolveLocaleHref` from `../lib/resolve-locale-href`.
  - Resolve locale: `const { lang = 'ar' } = useParams<{ lang: string }>()`.
  - Conditional announcement badge:
    - Guard: `Boolean(config.badgeKey && i18n.exists('home:' + config.badgeKey, { lng: lang, fallbackLng: false }))`.
    - Interactive badge: wrapped in `min-h-11 inline-flex items-center` container, rendering `<Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium cursor-pointer" render={<Link to={resolveLocaleHref(config.badgeHref, lang)} />}>{t(config.badgeKey, { ns: 'home' })}<ChevronEndIcon className="size-3 rtl:rotate-180" /></Badge>`.
    - Static badge: `<Badge variant="secondary" role="status" className="gap-1.5 px-3 py-1 text-xs font-medium">{t(config.badgeKey, { ns: 'home' })}</Badge>`.
  - Heading: `<h1 className="text-h1 font-bold text-foreground ltr:tracking-tight text-balance">{t('hero.title', { ns: 'home' })}</h1>`.
  - Subtitle: `<p className="text-body text-muted-foreground text-balance max-w-xl mx-auto">{t('hero.subtitle', { ns: 'home' })}</p>`.
  - Action controls:
    - Primary CTA: `<Button size="lg" variant="default" className="rounded-full px-8 font-semibold" nativeButton={false} render={<Link to={resolveLocaleHref(config.primaryCtaHref, lang)} />}>{t('hero.primaryCta', { ns: 'home' })}</Button>`.
    - Secondary link: `<Link to={resolveLocaleHref(config.secondaryCtaHref, lang)} className="min-h-11 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline px-3">{t('hero.secondaryCta', { ns: 'home' })}</Link>`.
  - Trust claims row: `<ul role="list" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2">` mapping `config.trustClaims ?? DEFAULT_HERO_TRUST_CLAIMS` with `ICON_MAP`.
  - Visual container: `<div className="w-full max-w-[1024px] aspect-16/9 sm:aspect-21/9 overflow-hidden rounded-3xl border border-border/50 bg-muted/20 flex items-center justify-center"><BrandLogoMark className="size-20 sm:size-28 text-muted-foreground/40" idPrefix="hero-placeholder" /><span className="sr-only">{t('hero.visualAlt', { ns: 'home' })}</span></div>`.
- **Checkpoint**: `pnpm --filter storefront typecheck`

---

### Phase 4: Verification & Integration

#### 7. `apps/storefront/src/features/home/components/hero-section.test.tsx` (Create)

- **Action**: Unit test suite for `HeroSection`.
- **Test Harness**: Wrap render in `MemoryRouter` with `<Routes><Route path="/:lang" element={<HeroSection config={mockConfig} />} /></Routes>` and `I18nextProvider`.
- **Test Cases**:
  - Test 1: Renders exactly one `<h1>` with translated title.
  - Test 2: Primary button links to resolved locale path (`/en/products` and `/ar/products`).
  - Test 3: Secondary link renders with minimum 44px tap target (`min-h-11`).
  - Test 4: Announcement badge does not render when `badgeKey` is undefined or missing in active language.
  - Test 5: Announcement badge renders with link, `variant="secondary"`, and trailing chevron when `badgeHref` is provided.
  - Test 6: Announcement badge renders static `role="status"` badge without chevron when `badgeHref` is omitted.
  - Test 7: Trust claims row renders exactly 3 items as an unordered list with `aria-hidden` icons.
  - Test 8: Asserts rendered DOM contains no physical direction classes using regex `/(^|\s)(ml|mr|pl|pr|left|right)-/` under Arabic RTL.

#### 8. `apps/storefront/src/features/home/home.test.tsx` (Modify)

- **Action**: Update home page integration tests to align with updated `DEFAULT_HOME_CONFIG`.
- **Changes**:
  - Update hero title assertions to match updated headline copy.
  - Update active section count assertion from 8 to 7, adjusting section index assertions (since `trust-strip` is disabled by default).
  - Update alternating background band test assertions for 7 active sections.
  - Update trust strip test case to pass an explicit configuration where `trust-strip.enabled = true`.

#### 9. `apps/storefront/src/features/home/README.md` (Modify)

- **Action**: Update architectural contract documentation.
- **Changes**:
  - Document updated `HeroSectionConfig`, `HeroTrustClaim`, and `DEFAULT_HERO_TRUST_CLAIMS`.
  - Document that `trust-strip` is disabled by default in `DEFAULT_HOME_CONFIG` to avoid landing page redundancy.

### Verification Plan

- **Helper Unit Tests**: `pnpm --filter storefront test apps/storefront/src/features/home/lib/resolve-locale-href.test.ts`
- **Component Unit Tests**: `pnpm --filter storefront test apps/storefront/src/features/home/components/hero-section.test.tsx`
- **Integration Tests**: `pnpm --filter storefront test apps/storefront/src/features/home/home.test.tsx`
- **Full Monorepo Tests**: `pnpm test`
- **Static Typecheck**: `pnpm typecheck`
- **Linter & Formatting**: `pnpm lint`
- **Production Build**: `pnpm build`

---

_Drafted and verified with EGM_
