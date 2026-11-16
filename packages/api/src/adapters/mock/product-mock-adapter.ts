import type {
  FilterOptionCount,
  Product,
  ProductCollection,
  ProductFilterCounts,
  ProductListFilter,
  ProductListResult,
} from '@workspace/domain/schemas/product'
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
      en: 'full warranty',
      ar: 'ضمان المدة',
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
      en: 'full warranty',
      ar: 'ضمان المدة',
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
      en: 'full warranty',
      ar: 'ضمان المدة',
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
      en: 'full warranty',
      ar: 'ضمان المدة',
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
      en: 'full warranty',
      ar: 'ضمان المدة',
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
  {
    id: 'prod-006',
    slug: 'office-2024-home-business',
    title: {
      en: 'Microsoft Office 2024 Home & Business',
      ar: 'مايكروسوفت أوفيس 2024 للمنازل والأعمال',
    },
    description: {
      en: 'full warranty',
      ar: 'ضمان المدة',
    },
    price: {
      amountMinor: 125000, // 1250.00 EGP
      currency: 'EGP',
    },
    originalPrice: {
      amountMinor: 180000,
      currency: 'EGP',
    },
    category: 'software',
    platform: 'microsoft',
    region: 'global',
    coverImage: '/images/products/office-2024.webp',
    inStock: true,
    featured: true,
    deliveryType: 'instant',
  },
  {
    id: 'prod-007',
    slug: 'elden-ring-shadow-erdtree',
    title: {
      en: 'Elden Ring: Shadow of the Erdtree Edition',
      ar: 'إلدن رينج: نسخة شادو أوف ذا إردتري',
    },
    description: {
      en: 'full warranty',
      ar: 'ضمان المدة',
    },
    price: {
      amountMinor: 185000, // 1850.00 EGP
      currency: 'EGP',
    },
    originalPrice: {
      amountMinor: 240000,
      currency: 'EGP',
    },
    category: 'games',
    platform: 'steam',
    region: 'global',
    coverImage: '/images/products/elden-ring.webp',
    inStock: true,
    featured: true,
    deliveryType: 'instant',
  },
  {
    id: 'prod-008',
    slug: 'black-myth-wukong',
    title: {
      en: 'Black Myth: Wukong (PC / Steam)',
      ar: 'بلاك ميث: ووكونغ (حاسوب / ستيم)',
    },
    description: {
      en: 'full warranty',
      ar: 'ضمان المدة',
    },
    price: {
      amountMinor: 160000, // 1600.00 EGP
      currency: 'EGP',
    },
    category: 'games',
    platform: 'steam',
    region: 'global',
    coverImage: '/images/products/wukong.webp',
    inStock: true,
    featured: true,
    deliveryType: 'instant',
  },
]

export class MockProductAdapter implements ProductService {
  private readonly products: Product[] = [...MOCK_PRODUCTS]

  async list(filter?: ProductListFilter): Promise<ProductListResult> {
    let result = [...this.products]

    if (filter?.category) {
      const categories = Array.isArray(filter.category) ? filter.category : [filter.category]
      if (categories.length > 0) {
        result = result.filter((p) => categories.includes(p.category))
      }
    }
    if (filter?.platform) {
      const platforms = Array.isArray(filter.platform) ? filter.platform : [filter.platform]
      if (platforms.length > 0) {
        result = result.filter((p) => platforms.includes(p.platform))
      }
    }
    if (filter?.region) {
      const regions = Array.isArray(filter.region) ? filter.region : [filter.region]
      if (regions.length > 0) {
        result = result.filter((p) => regions.includes(p.region))
      }
    }
    if (filter?.featured !== undefined) {
      result = result.filter((p) => p.featured === filter.featured)
    }
    if (filter?.inStock) {
      result = result.filter((p) => p.inStock)
    }
    if (filter?.onSale) {
      result = result.filter((p) => Boolean(p.originalPrice && p.originalPrice.amountMinor > p.price.amountMinor))
    }
    if (filter?.priceMin !== undefined) {
      result = result.filter((p) => (p.price.amountMinor / 100) >= filter.priceMin!)
    }
    if (filter?.priceMax !== undefined) {
      result = result.filter((p) => (p.price.amountMinor / 100) <= filter.priceMax!)
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

    // Sorting: Featured (default), Best selling, Price low-high, Price high-low, Newest
    const sort = filter?.sort ?? 'featured'
    switch (sort) {
      case 'best-selling':
        result.sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1
          if (a.inStock !== b.inStock) return a.inStock ? -1 : 1
          return 0
        })
        break
      case 'price-asc':
        result.sort((a, b) => a.price.amountMinor - b.price.amountMinor)
        break
      case 'price-desc':
        result.sort((a, b) => b.price.amountMinor - a.price.amountMinor)
        break
      case 'newest':
        // Reverse original order
        result = [...result].reverse()
        break
      case 'featured':
      default:
        // Default order preserves mock featured order
        break
    }

    const total = result.length
    const page = filter?.page ?? 1
    const pageSize = filter?.pageSize ?? 24
    const limit = page * pageSize
    const items = result.slice(0, limit)
    const hasMore = total > items.length

    return {
      items,
      total,
      page,
      pageSize,
      hasMore,
    }
  }

  async getFilterCounts(_filter?: ProductListFilter): Promise<ProductFilterCounts> {
    // Only count options that exist in products.
    // If filter contains restrictions other than category, we can count available categories, etc.
    // For pure faceted counts, calculate from all products or filtered base:
    const base = [...this.products]

    const categoryMap = new Map<string, number>()
    const platformMap = new Map<string, number>()
    const regionMap = new Map<string, number>()
    let inStockCount = 0
    let onSaleCount = 0

    for (const p of base) {
      categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + 1)
      platformMap.set(p.platform, (platformMap.get(p.platform) ?? 0) + 1)
      regionMap.set(p.region, (regionMap.get(p.region) ?? 0) + 1)
      if (p.inStock) inStockCount++
      if (p.originalPrice && p.originalPrice.amountMinor > p.price.amountMinor) onSaleCount++
    }

    const toSortedCounts = (map: Map<string, number>): FilterOptionCount[] =>
      Array.from(map.entries())
        .filter(([, count]) => count > 0)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)

    return {
      categories: toSortedCounts(categoryMap),
      platforms: toSortedCounts(platformMap),
      regions: toSortedCounts(regionMap),
      inStockCount,
      onSaleCount,
      total: base.length,
    }
  }

  async listByCollection(collection: ProductCollection): Promise<Product[]> {
    switch (collection) {
      case 'best-sellers':
        return this.products.filter((p) => p.featured || p.inStock).slice(0, 8)
      case 'deals':
        return this.products
          .filter(
            (p) =>
              p.originalPrice &&
              p.originalPrice.amountMinor > p.price.amountMinor,
          )
          .slice(0, 8)
      case 'new':
        return [...this.products].reverse().slice(0, 8)
    }
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

