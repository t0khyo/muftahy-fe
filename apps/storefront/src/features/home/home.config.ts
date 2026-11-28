export type HomeSectionType =
  | 'hero'
  | 'browse'
  | 'category-tiles'
  | 'platform-strip'
  | 'product-rail'
  | 'trust-strip'
  | 'faq'
  | 'bundles'
  | 'how-it-works'
  | 'social-proof'
  | 'support'

export interface BaseSectionConfig {
  id: string
  type: HomeSectionType
  enabled: boolean
}

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
  primaryCtaHref: string
  secondaryCtaHref: string
  badgeKey?: string
  badgeHref?: string
  trustClaims?: HeroTrustClaim[]
}

export interface BrowseCategoryTile {
  id: string
  slug?: string
  code?: string
  labelKey?: string
  descKey?: string
  href: string
  icon?: 'monitor' | 'file-spreadsheet' | 'shield-check' | string
  productCount?: number
}

export interface BrowseSectionConfig extends BaseSectionConfig {
  type: 'browse'
  titleKey?: string
  subtitleKey?: string
  categories?: BrowseCategoryTile[]
}

export interface CategoryTileItem {
  id: string
  labelKey: string
  href: string
  icon: 'gamepad' | 'app-window' | 'gift' | 'credit-card'
}

export interface CategoryTilesSectionConfig extends BaseSectionConfig {
  type: 'category-tiles'
  items: CategoryTileItem[]
}

export interface PlatformPillItem {
  id: string
  name: string
  href: string
}

export interface PlatformStripSectionConfig extends BaseSectionConfig {
  type: 'platform-strip'
  items: PlatformPillItem[]
}

export interface ProductRailSectionConfig extends BaseSectionConfig {
  type: 'product-rail'
  collection?: string
  category?: string
  is_featured?: boolean
  titleKey: string
  viewAllHref: string
}

export interface TrustItem {
  id: string
  titleKey: string
  descKey: string
  icon: 'zap' | 'shield-check' | 'headphones' | 'globe'
}

export interface TrustStripSectionConfig extends BaseSectionConfig {
  type: 'trust-strip'
  items: TrustItem[]
}

export interface FaqItem {
  id: string
  questionKey: string
  answerKey: string
}

export interface FaqSectionConfig extends BaseSectionConfig {
  type: 'faq'
  items: FaqItem[]
}

export interface BundlesSectionConfig extends BaseSectionConfig {
  type: 'bundles'
  titleKey: string
  subtitleKey?: string
}

export interface HowItWorksSectionConfig extends BaseSectionConfig {
  type: 'how-it-works'
  titleKey: string
  subtitleKey?: string
}

export interface SocialProofSectionConfig extends BaseSectionConfig {
  type: 'social-proof'
  titleKey: string
  subtitleKey?: string
}

export interface SupportSectionConfig extends BaseSectionConfig {
  type: 'support'
  titleKey: string
  subtitleKey?: string
  whatsappNumber?: string
  hoursKey?: string
}

export type HomeSection =
  | HeroSectionConfig
  | BrowseSectionConfig
  | CategoryTilesSectionConfig
  | PlatformStripSectionConfig
  | ProductRailSectionConfig
  | TrustStripSectionConfig
  | FaqSectionConfig
  | BundlesSectionConfig
  | HowItWorksSectionConfig
  | SocialProofSectionConfig
  | SupportSectionConfig

export interface HomeConfig {
  sections: HomeSection[]
}

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  sections: [
    {
      id: 'hero',
      type: 'hero',
      enabled: true,
      primaryCtaHref: '/:lang/products',
      secondaryCtaHref: '/:lang/how-it-works',
      trustClaims: DEFAULT_HERO_TRUST_CLAIMS,
    },
    {
      id: 'best-sellers',
      type: 'product-rail',
      enabled: true,
      collection: 'featured',
      is_featured: true,
      titleKey: 'bestSellers',
      viewAllHref: '/:lang/products',
    },
    {
      id: 'bundles',
      type: 'bundles',
      enabled: true,
      titleKey: 'bundles.title',
      subtitleKey: 'bundles.subtitle',
    },
    {
      id: 'browse',
      type: 'browse',
      enabled: true,
      titleKey: 'browse.title',
      subtitleKey: 'browse.subtitle',
    },
    {
      id: 'how-it-works',
      type: 'how-it-works',
      enabled: true,
      titleKey: 'howItWorks.title',
      subtitleKey: 'howItWorks.subtitle',
    },
    {
      id: 'social-proof',
      type: 'social-proof',
      enabled: true,
      titleKey: 'socialProof.title',
      subtitleKey: 'socialProof.subtitle',
    },
    {
      id: 'faq',
      type: 'faq',
      enabled: true,
      items: [
        { id: 'item-1', questionKey: 'q1', answerKey: 'a1' },
        { id: 'item-2', questionKey: 'q2', answerKey: 'a2' },
        { id: 'item-3', questionKey: 'q3', answerKey: 'a3' },
        { id: 'item-4', questionKey: 'q4', answerKey: 'a4' },
        { id: 'item-5', questionKey: 'q5', answerKey: 'a5' },
      ],
    },
    {
      id: 'support',
      type: 'support',
      enabled: true,
      titleKey: 'support.title',
      subtitleKey: 'support.subtitle',
      whatsappNumber: '1234567890',
    },
  ],
}
