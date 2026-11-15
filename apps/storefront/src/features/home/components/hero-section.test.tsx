import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { HeroSection } from './hero-section'
import {
  DEFAULT_HERO_TRUST_CLAIMS,
  type HeroSectionConfig,
} from '../home.config'

const baseConfig: HeroSectionConfig = {
  id: 'hero',
  type: 'hero',
  enabled: true,
  primaryCtaHref: '/:lang/products',
  secondaryCtaHref: '/:lang/how-it-works',
  trustClaims: DEFAULT_HERO_TRUST_CLAIMS,
}

function renderHeroSection(
  initialRoute = '/en',
  config: HeroSectionConfig = baseConfig,
) {
  const isAr = initialRoute.startsWith('/ar')
  i18n.changeLanguage(isAr ? 'ar' : 'en')
  document.documentElement.lang = isAr ? 'ar' : 'en'
  document.documentElement.dir = isAr ? 'rtl' : 'ltr'

  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/:lang" element={<HeroSection config={config} />} />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  )
}

describe('HeroSection', () => {
  it('renders exactly one <h1> with translated title', () => {
    renderHeroSection('/en')

    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent(
      /all your digital products at fair prices/i,
    )
  })

  it('renders primary CTA button linking to resolved path', () => {
    renderHeroSection('/en')

    const primaryButton = screen.getByRole('button', {
      name: /browse products/i,
    })
    expect(primaryButton).toBeInTheDocument()
    expect(primaryButton.tagName.toLowerCase()).toBe('a')
    expect(primaryButton).toHaveAttribute('href', '/en/products')
  })

  it('renders primary CTA button linking to resolved Arabic path in RTL', () => {
    renderHeroSection('/ar')

    const primaryButton = screen.getByRole('button', {
      name: /تصفح المنتجات/i,
    })
    expect(primaryButton).toBeInTheDocument()
    expect(primaryButton).toHaveAttribute('href', '/ar/products')
  })

  it('renders secondary text link with min-h-11 touch target and correct href', () => {
    renderHeroSection('/en')

    const secondaryLink = screen.getByRole('link', {
      name: /learn how it works/i,
    })
    expect(secondaryLink).toBeInTheDocument()
    expect(secondaryLink).toHaveAttribute('href', '/en/how-it-works')
    expect(secondaryLink).toHaveClass('min-h-11')
  })

  it('does not render announcement badge when badgeKey is undefined', () => {
    renderHeroSection('/en', baseConfig)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(
      screen.queryByText(/ramadan deals/i),
    ).not.toBeInTheDocument()
  })

  it('does not render announcement badge when badgeKey is missing in active language', () => {
    const configWithMissingKey: HeroSectionConfig = {
      ...baseConfig,
      badgeKey: 'nonExistentBadgeKey123',
    }

    renderHeroSection('/en', configWithMissingKey)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders announcement badge as an interactive link with chevron when badgeHref is provided', () => {
    const configWithBadgeLink: HeroSectionConfig = {
      ...baseConfig,
      badgeKey: 'hero.seasonalBadge',
      badgeHref: '/:lang/deals',
    }

    renderHeroSection('/en', configWithBadgeLink)

    const badgeLink = screen.getByRole('link', {
      name: /ramadan deals • up to 50% off/i,
    })
    expect(badgeLink).toBeInTheDocument()
    expect(badgeLink).toHaveAttribute('href', '/en/deals')
    // Parent wrapper guarantees 44px tap target
    expect(badgeLink.closest('.min-h-11')).toBeInTheDocument()
  })

  it('renders static announcement badge with role="status" when badgeHref is omitted', () => {
    const configWithStaticBadge: HeroSectionConfig = {
      ...baseConfig,
      badgeKey: 'hero.seasonalBadge',
    }

    renderHeroSection('/en', configWithStaticBadge)

    const staticBadge = screen.getByRole('status')
    expect(staticBadge).toBeInTheDocument()
    expect(staticBadge).toHaveTextContent(/ramadan deals • up to 50% off/i)
    expect(staticBadge.tagName.toLowerCase()).not.toBe('a')
  })

  it('renders trust claims row as an unordered list with aria-hidden icons', () => {
    const { container } = renderHeroSection('/en')

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()

    const items = list.querySelectorAll('li')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent(/instant delivery/i)
    expect(items[1]).toHaveTextContent(/verified licenses/i)
    expect(items[2]).toHaveTextContent(/activation support/i)

    const icons = list.querySelectorAll('svg[aria-hidden="true"]')
    expect(icons).toHaveLength(3)

    // Visual placeholder block
    expect(screen.getByTestId('hero-visual-placeholder')).toBeInTheDocument()
    expect(container.querySelector('#hero-logo')).toBeInTheDocument()
  })

  it('renders properly under Arabic RTL without physical direction classes', () => {
    const { container } = renderHeroSection('/ar')

    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('ar')

    // Arabic title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /كل منتجاتك الرقمية بأسعار معقولة/i,
    )

    // Verify absence of physical margin/padding/alignment utility classes
    const html = container.innerHTML
    const physicalDirRegex = /(^|\s)(ml|mr|pl|pr|text-left|text-right)-[^\s"'>]+/
    expect(physicalDirRegex.test(html)).toBe(false)
  })
})
