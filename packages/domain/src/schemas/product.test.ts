import { describe, expect, it } from 'vitest'
import {
  categoryCreateSchema,
  categoryDetailResponseSchema,
  categoryResponseSchema,
  categoryUpdateSchema,
  imageReorderRequestSchema,
  isUuid,
  productCreateSchema,
  productImageResponseSchema,
  productResponseSchema,
  productUpdateSchema,
  slugify,
  validateSkuForCategory,
  type CategoryResponse,
  type ProductResponse,
} from './product'

describe('productResponseSchema', () => {
  const validCategory: CategoryResponse = {
    id: '11111111-1111-4000-8000-111111111111',
    name: 'Operating Systems',
    code: 'OS',
    slug: 'operating-systems',
    description: 'Operating systems licenses',
    display_order: 1,
    is_active: true,
    product_count: 5,
  }

  const validProduct: ProductResponse = {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Windows 11 Professional',
    category: validCategory,
    sku: 'OS-WIN11-PRO-RET',
    slug: 'windows-11-professional',
    variant: 'retail',
    base_price: '499.00',
    sale_price: '349.00',
    effective_price: '349.00',
    discount_percentage: 30,
    stock_status: 'in_stock',
    available_count: 14,
    preorder_enabled: true,
    description: 'Genuine Microsoft Windows 11 Pro digital retail license key.',
    is_active: true,
    primary_image_url: '/storage/products/win11.webp',
    images: [
      {
        id: '22222222-2222-4000-8000-222222222222',
        file_path: 'products/win11.webp',
        alt_text: 'Windows 11 Cover',
        is_primary: true,
        display_order: 0,
        file_size: 102400,
        mime_type: 'image/webp',
        width: 1200,
        height: 900,
        url: '/storage/products/win11.webp',
      },
    ],
  }

  it('validates a complete active product', () => {
    const result = productResponseSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
  })

  it('validates a product with null variant and null sale_price', () => {
    const productWithNulls = {
      ...validProduct,
      variant: null,
      sale_price: null,
      discount_percentage: null,
      description: null,
      primary_image_url: null,
      images: [],
    }
    const result = productResponseSchema.safeParse(productWithNulls)
    expect(result.success).toBe(true)
  })

  it('coerces numeric prices to formatted decimal strings', () => {
    const numericPrices = {
      ...validProduct,
      base_price: 499,
      sale_price: 349,
      effective_price: 349,
    }
    const result = productResponseSchema.safeParse(numericPrices)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.base_price).toBe('499.00')
      expect(result.data.sale_price).toBe('349.00')
    }
  })

  it('defaults is_active to true and images to empty array when omitted', () => {
    const { is_active: _omitted, images: _imgOmitted, ...withoutActive } = validProduct
    const parsed = productResponseSchema.parse(withoutActive)
    expect(parsed.is_active).toBe(true)
    expect(parsed.images).toEqual([])
  })

  it('rejects invalid uuid, invalid sku, or negative available_count', () => {
    expect(
      productResponseSchema.safeParse({ ...validProduct, id: 'invalid-id' }).success,
    ).toBe(false)
    expect(
      productResponseSchema.safeParse({ ...validProduct, sku: 'invalid-sku' }).success,
    ).toBe(false)
    expect(
      productResponseSchema.safeParse({ ...validProduct, available_count: -1 }).success,
    ).toBe(false)
  })

  it('rejects unsupported stock_status', () => {
    expect(
      productResponseSchema.safeParse({ ...validProduct, stock_status: 'backorder' }).success,
    ).toBe(false)
  })
})

describe('Category schemas', () => {
  it('validates categoryResponseSchema and categoryDetailResponseSchema', () => {
    const cat = {
      id: '11111111-1111-4000-8000-111111111111',
      name: 'Security Software',
      code: 'SEC',
      slug: 'security-software',
      description: 'Antivirus and security tools',
      display_order: 2,
      is_active: true,
      product_count: 10,
    }
    expect(categoryResponseSchema.safeParse(cat).success).toBe(true)

    const detail = {
      ...cat,
      products: [],
    }
    expect(categoryDetailResponseSchema.safeParse(detail).success).toBe(true)
  })

  it('validates categoryCreateSchema and normalizes empty strings', () => {
    const input = {
      name: 'Office Applications',
      code: 'off',
      slug: '',
      description: '',
      display_order: '3',
    }
    const result = categoryCreateSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.code).toBe('OFF')
      expect(result.data.slug).toBeUndefined()
      expect(result.data.description).toBeNull()
      expect(result.data.display_order).toBe(3)
    }
  })

  it('validates categoryUpdateSchema partial payloads', () => {
    const update = {
      name: 'Updated Office',
      is_active: false,
    }
    const result = categoryUpdateSchema.safeParse(update)
    expect(result.success).toBe(true)
  })
})

describe('Image schemas', () => {
  it('validates productImageResponseSchema', () => {
    const img = {
      id: '22222222-2222-4000-8000-222222222222',
      file_path: 'products/img1.webp',
      alt_text: 'Preview',
      is_primary: true,
      display_order: 0,
      file_size: 50000,
      mime_type: 'image/webp',
      width: 800,
      height: 600,
      url: '/storage/products/img1.webp',
    }
    expect(productImageResponseSchema.safeParse(img).success).toBe(true)
  })

  it('validates imageReorderRequestSchema', () => {
    const reorder = {
      items: [
        { image_id: '22222222-2222-4000-8000-222222222222', display_order: 1 },
        { image_id: '33333333-3333-4000-8000-333333333333', display_order: 0 },
      ],
    }
    expect(imageReorderRequestSchema.safeParse(reorder).success).toBe(true)
  })
})

describe('productCreateSchema & productUpdateSchema', () => {
  it('validates valid product creation input with price rules', () => {
    const createInput = {
      name: 'Office 2021 Professional Plus',
      category_id: '11111111-1111-4000-8000-111111111111',
      sku: 'OFF-2021-PRO-RET',
      slug: 'office-2021-pro-plus',
      variant: 'retail',
      base_price: '899.00',
      sale_price: '699.00',
      preorder_enabled: true,
      description: 'One-time purchase for 1 PC.',
    }
    const result = productCreateSchema.safeParse(createInput)
    expect(result.success).toBe(true)
  })

  it('rejects productCreateSchema when sale_price >= base_price', () => {
    const invalidInput = {
      name: 'Office 2021 Professional Plus',
      category_id: '11111111-1111-4000-8000-111111111111',
      sku: 'OFF-2021-PRO-RET',
      base_price: '500.00',
      sale_price: '600.00',
    }
    expect(productCreateSchema.safeParse(invalidInput).success).toBe(false)
  })

  it('validates partial updates in productUpdateSchema when only sale_price is provided', () => {
    const updateInput = {
      sale_price: '299.00',
      is_active: false,
    }
    const result = productUpdateSchema.safeParse(updateInput)
    expect(result.success).toBe(true)
  })

  it('validates productUpdateSchema when both base_price and sale_price are provided', () => {
    const validUpdate = {
      base_price: '500.00',
      sale_price: '400.00',
    }
    expect(productUpdateSchema.safeParse(validUpdate).success).toBe(true)

    const invalidUpdate = {
      base_price: '500.00',
      sale_price: '550.00',
    }
    expect(productUpdateSchema.safeParse(invalidUpdate).success).toBe(false)
  })
})

describe('Pure helpers', () => {
  it('isUuid correctly identifies standard UUIDs', () => {
    expect(isUuid('00000000-0000-4000-8000-000000000001')).toBe(true)
    expect(isUuid('windows-11-pro')).toBe(false)
    expect(isUuid('')).toBe(false)
  })

  it('slugify transforms text to URL-safe ASCII slug and handles non-ASCII/Arabic', () => {
    expect(slugify('Windows 11 Professional Edition!')).toBe('windows-11-professional-edition')
    expect(slugify('  Office 365 -- Family  ')).toBe('office-365-family')
    // Arabic-only input contains no ASCII alphanumerics and returns empty string
    expect(slugify('ويندوز 11')).toBe('11')
    expect(slugify('ويندوز')).toBe('')
  })

  it('validateSkuForCategory verifies format and category code prefix', () => {
    expect(validateSkuForCategory('OS-WIN11-PRO-RET', 'OS')).toBe(true)
    expect(validateSkuForCategory('OS-WIN11-PRO-RET', 'SEC')).toBe(false)
    expect(validateSkuForCategory('invalid-sku-format', 'OS')).toBe(false)
  })
})
