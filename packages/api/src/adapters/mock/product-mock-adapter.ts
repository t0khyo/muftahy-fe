import type { Product, ProductListFilter } from '@workspace/domain/schemas/product'
import type { ProductService } from '../../services/product-service'

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    slug: 'windows-11-pro',
    title: {
      en: 'Windows 11 Professional Retail Key',
      ar: 'مفتاح ترخيص ويندوز 11 بروفيشنال الأصلي',
    },
    description: {
      en: 'Official lifetime license key for 1 PC with all enterprise and security features unlocked.',
      ar: 'مفتاح ترخيص رسمي مدى الحياة لجهاز حاسوب واحد مع تفعيل كافة ميزات الأمان والأعمال.',
    },
    price: {
      amountMinor: 65000, // 650.00 EGP
      currency: 'EGP',
    },
    originalPrice: {
      amountMinor: 95000, // 950.00 EGP
      currency: 'EGP',
    },
    category: 'software',
    platform: 'microsoft',
    region: 'global',
    coverImage: '/images/products/windows-11.webp',
    inStock: true,
    featured: true,
    deliveryType: 'instant',
  },
  {
    id: 'prod-002',
    slug: 'cyberpunk-2077',
    title: {
      en: 'Cyberpunk 2077: Ultimate Edition (PC)',
      ar: 'سايبر بانك 2077: النسخة الكاملة (حاسوب)',
    },
    description: {
      en: 'An open-world, action-adventure RPG set in the megalopolis of Night City including Phantom Liberty.',
      ar: 'لعبة تقمص أدوار وأكشن في عالم مفتوح بمدينة نايت سيتي متضمنة توسعة فانتوم ليبرتي.',
    },
    price: {
      amountMinor: 145000, // 1450.00 EGP
      currency: 'EGP',
    },
    originalPrice: {
      amountMinor: 210000,
      currency: 'EGP',
    },
    category: 'games',
    platform: 'steam',
    region: 'global',
    coverImage: '/images/products/cyberpunk-2077.webp',
    inStock: true,
    featured: true,
    deliveryType: 'instant',
  },
  {
    id: 'prod-003',
    slug: 'xbox-game-pass-ultimate-3m',
    title: {
      en: 'Xbox Game Pass Ultimate - 3 Months Subscription',
      ar: 'اشتراك إكس بوكس جيم باس ألتيميت - 3 أشهر',
    },
    description: {
      en: 'Play hundreds of high-quality console and PC games plus Xbox Cloud Gaming.',
      ar: 'العب مئات الألعاب عالية الجودة على الكونسول والحاسوب بالإضافة إلى الألعاب السحابية.',
    },
    price: {
      amountMinor: 89000, // 890.00 EGP
      currency: 'EGP',
    },
    category: 'subscriptions',
    platform: 'xbox',
    region: 'gcc',
    coverImage: '/images/products/xbox-game-pass.webp',
    inStock: true,
    featured: true,
    deliveryType: 'instant',
  },
  {
    id: 'prod-004',
    slug: 'steam-gift-card-50-usd',
    title: {
      en: 'Steam Wallet Card $50 USD (Global)',
      ar: 'بطاقة رصيد ستيم 50 دولار أمريكي (عالمي)',
    },
    description: {
      en: 'Add 50 USD directly to your Steam wallet to buy games, software, and hardware.',
      ar: 'أضف 50 دولار مباشرة إلى محفظة ستيم الخاصة بك لشراء الألعاب والبرامج والعتاد.',
    },
    price: {
      amountMinor: 5000, // 50.00 USD
      currency: 'USD',
    },
    category: 'gift-cards',
    platform: 'steam',
    region: 'global',
    coverImage: '/images/products/steam-gift-card.webp',
    inStock: true,
    featured: false,
    deliveryType: 'instant',
  },
  {
    id: 'prod-005',
    slug: 'playstation-network-card-100-sar',
    title: {
      en: 'PlayStation Store 100 SAR (Saudi Account)',
      ar: 'بطاقة متجر بلايستيشن 100 ريال سعودي (حساب سعودي)',
    },
    description: {
      en: 'Recharge your PlayStation Network wallet to purchase games, DLCs, and subscriptions.',
      ar: 'اشحن محفظة بلايستيشن لشراء أحدث الألعاب والإضافات والاشتراكات.',
    },
    price: {
      amountMinor: 10000, // 100.00 SAR
      currency: 'SAR',
    },
    category: 'gift-cards',
    platform: 'playstation',
    region: 'gcc',
    coverImage: '/images/products/psn-card.webp',
    inStock: false,
    featured: false,
    deliveryType: 'instant',
  },
]

export class MockProductAdapter implements ProductService {
  private readonly products: Product[] = [...MOCK_PRODUCTS]

  async list(filter?: ProductListFilter): Promise<Product[]> {
    let result = [...this.products]

    if (filter?.category) {
      result = result.filter((p) => p.category === filter.category)
    }
    if (filter?.platform) {
      result = result.filter((p) => p.platform === filter.platform)
    }
    if (filter?.region) {
      result = result.filter((p) => p.region === filter.region)
    }
    if (filter?.featured !== undefined) {
      result = result.filter((p) => p.featured === filter.featured)
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.en.toLowerCase().includes(q) ||
          p.title.ar.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q),
      )
    }

    return result
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const product = this.products.find((p) => p.slug === slug)
    return product ?? null
  }

  async getById(id: string): Promise<Product | null> {
    const product = this.products.find((p) => p.id === id)
    return product ?? null
  }

  async getSampleLicenseKey(_productId: string): Promise<string> {
    // Obvious mock key pattern: XXXXX-XXXXX-XXXXX as required by security guidelines
    return 'XXXXX-XXXXX-XXXXX'
  }
}

