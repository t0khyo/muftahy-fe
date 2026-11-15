import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  DEFAULT_HOME_CONFIG,
  type HomeConfig,
  type ProductRailSectionConfig,
} from '../home.config'
import { HeroSection } from './hero-section'
import { CategoryTiles } from './category-tiles'
import { PlatformStrip } from './platform-strip'
import { TrustStrip } from './trust-strip'
import { FaqSection } from './faq-section'
import { BundlesSection } from './bundles-section'
import { HowItWorksSection } from './how-it-works-section'
import { SocialProofSection } from './social-proof-section'
import { SupportSection } from './support-section'

export interface HomePageProps {
  config?: HomeConfig
  renderProductRail?: (
    props: ProductRailSectionConfig & { className?: string },
  ) => React.ReactNode
}

export function HomePage({
  config = DEFAULT_HOME_CONFIG,
  renderProductRail,
}: HomePageProps) {
  const { t } = useTranslation(['home', 'common'])

  // Filter only enabled sections from configuration
  const enabledSections = React.useMemo(
    () => config.sections.filter((s) => s.enabled),
    [config.sections],
  )

  return (
    <div className="w-full">
      {/* React 19 Native Head Metadata */}
      <title>{t('seo.title', { ns: 'home' })}</title>
      <meta
        name="description"
        content={t('seo.description', { ns: 'home' })}
      />

      {/* Render sections in exact config order with alternating background and secondary bands */}
      {enabledSections.map((section, index) => {
        const bandBg = index % 2 === 0 ? 'bg-background' : 'bg-secondary/40'

        switch (section.type) {
          case 'hero':
            return (
              <HeroSection
                key={section.id}
                config={section}
                className={bandBg}
              />
            )

          case 'category-tiles':
            return (
              <CategoryTiles
                key={section.id}
                config={section}
                className={bandBg}
              />
            )

          case 'platform-strip':
            return (
              <PlatformStrip
                key={section.id}
                config={section}
                className={bandBg}
              />
            )

          case 'product-rail':
            return renderProductRail ? (
              <React.Fragment key={section.id}>
                {renderProductRail({ ...section, className: bandBg })}
              </React.Fragment>
            ) : null

          case 'trust-strip':
            return (
              <TrustStrip
                key={section.id}
                config={section}
                className={bandBg}
              />
            )

          case 'faq':
            return (
              <FaqSection
                key={section.id}
                config={section}
                className={bandBg}
              />
            )

          case 'bundles':
            return (
              <BundlesSection
                key={section.id}
                config={section}
                className={bandBg}
              />
            )

          case 'how-it-works':
            return (
              <HowItWorksSection
                key={section.id}
                config={section}
                className={bandBg}
              />
            )

          case 'social-proof':
            return (
              <SocialProofSection
                key={section.id}
                config={section}
                className={bandBg}
              />
            )

          case 'support':
            return (
              <SupportSection
                key={section.id}
                config={section}
                className={bandBg}
              />
            )

          default:
            return null
        }
      })}
    </div>
  )
}

