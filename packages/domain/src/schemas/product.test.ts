import { describe, expect, it } from 'vitest'
import { getSummaryPlan, productSchema, type Product } from './product'

describe('productSchema & getSummaryPlan', () => {
  const baseProduct: Product = {
    id: 'test-001',
    slug: 'test-product',
    title: { en: 'Test Product', ar: 'منتج تجريبي' },
    description: { en: 'Description', ar: 'الوصف' },
    price: { amountMinor: 1000, currency: 'USD' },
    category: 'software',
    platform: 'pc',
    region: 'global',
    coverImage: '/images/test.webp',
    inStock: true,
    featured: false,
    deliveryType: 'instant',
    includes: [],
    activationSteps: [],
    faq: [],
    relatedSlugs: [],
    media: [],
    plans: [],
  }

  it('validates a product with plans, specs, and details', () => {
    const fullProduct = {
      ...baseProduct,
      tagline: { en: 'Fast & Secure', ar: 'سريع وآمن' },
      regionNote: { en: 'Global key', ar: 'مفتاح عالمي' },
      includes: [{ en: 'License Key', ar: 'مفتاح الترخيص' }],
      activationSteps: [{ en: 'Enter code', ar: 'أدخل الرمز' }],
      specs: {
        licenseType: { en: 'Retail', ar: 'تجزئة' },
        edition: { en: 'Standard', ar: 'قياسي' },
        language: { en: 'All', ar: 'الكل' },
        deliveryTime: { en: 'Instant', ar: 'فوري' },
      },
      faq: [{ question: { en: 'Q?', ar: 'س؟' }, answer: { en: 'A', ar: 'ج' } }],
      relatedSlugs: ['other-slug'],
      plans: [
        {
          id: 'p1',
          slug: '1-pc',
          name: { en: '1 PC', ar: 'جهاز 1' },
          price: { amountMinor: 1000, currency: 'USD' },
          stock: 10,
          deliveryType: 'instant',
        },
      ],
      defaultPlanSlug: '1-pc',
    }

    const parsed = productSchema.parse(fullProduct)
    expect(parsed.plans?.length).toBe(1)
    expect(parsed.specs?.licenseType.en).toBe('Retail')
  })

  it('returns synthesized plan when product has no plans array', () => {
    const summary = getSummaryPlan(baseProduct)
    expect(summary.slug).toBe('default')
    expect(summary.price.amountMinor).toBe(1000)
    expect(summary.stock).toBe(10)
  })

  it('selects default plan when it is in stock', () => {
    const product: Product = {
      ...baseProduct,
      defaultPlanSlug: 'plan-b',
      plans: [
        {
          id: 'p-a',
          slug: 'plan-a',
          name: { en: 'Plan A', ar: 'خطة أ' },
          price: { amountMinor: 800, currency: 'USD' },
          stock: 5,
          deliveryType: 'instant',
        },
        {
          id: 'p-b',
          slug: 'plan-b',
          name: { en: 'Plan B', ar: 'خطة ب' },
          price: { amountMinor: 1500, currency: 'USD' },
          stock: 10,
          deliveryType: 'instant',
        },
      ],
    }

    const summary = getSummaryPlan(product)
    expect(summary.slug).toBe('plan-b')
    expect(summary.price.amountMinor).toBe(1500)
  })

  it('falls back to first in-stock plan when default is out of stock', () => {
    const product: Product = {
      ...baseProduct,
      defaultPlanSlug: 'plan-b',
      plans: [
        {
          id: 'p-a',
          slug: 'plan-a',
          name: { en: 'Plan A', ar: 'خطة أ' },
          price: { amountMinor: 800, currency: 'USD' },
          stock: 5,
          deliveryType: 'instant',
        },
        {
          id: 'p-b',
          slug: 'plan-b',
          name: { en: 'Plan B', ar: 'خطة ب' },
          price: { amountMinor: 1500, currency: 'USD' },
          stock: 0,
          deliveryType: 'instant',
        },
      ],
    }

    const summary = getSummaryPlan(product)
    expect(summary.slug).toBe('plan-a')
    expect(summary.price.amountMinor).toBe(800)
  })

  it('returns default plan when all plans are out of stock', () => {
    const product: Product = {
      ...baseProduct,
      defaultPlanSlug: 'plan-b',
      plans: [
        {
          id: 'p-a',
          slug: 'plan-a',
          name: { en: 'Plan A', ar: 'خطة أ' },
          price: { amountMinor: 800, currency: 'USD' },
          stock: 0,
          deliveryType: 'instant',
        },
        {
          id: 'p-b',
          slug: 'plan-b',
          name: { en: 'Plan B', ar: 'خطة ب' },
          price: { amountMinor: 1500, currency: 'USD' },
          stock: 0,
          deliveryType: 'instant',
        },
      ],
    }

    const summary = getSummaryPlan(product)
    expect(summary.slug).toBe('plan-b')
  })
})
