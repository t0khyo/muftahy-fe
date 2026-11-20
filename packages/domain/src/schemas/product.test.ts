import { describe, expect, it } from 'vitest'
import {
  productCreateSchema,
  productResponseSchema,
  productUpdateSchema,
  type ProductResponse,
} from './product'

describe('productResponseSchema', () => {
  const validProduct: ProductResponse = {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Windows 11 Professional',
    category: 'windows',
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
    }
    const result = productResponseSchema.safeParse(productWithNulls)
    expect(result.success).toBe(true)
  })

  it('defaults is_active to true when omitted in payload', () => {
    const { is_active: _omitted, ...withoutActive } = validProduct
    const parsed = productResponseSchema.parse(withoutActive)
    expect(parsed.is_active).toBe(true)
  })

  it('rejects invalid uuid, invalid category, or negative available_count', () => {
    expect(
      productResponseSchema.safeParse({ ...validProduct, id: 'invalid-id' }).success,
    ).toBe(false)
    expect(
      productResponseSchema.safeParse({ ...validProduct, category: 'gaming' }).success,
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

describe('productCreateSchema & productUpdateSchema', () => {
  it('validates valid product creation input', () => {
    const createInput = {
      name: 'Office 2021 Professional Plus',
      category: 'office',
      variant: 'retail',
      base_price: '899.00',
      sale_price: '699.00',
      preorder_enabled: true,
      description: 'One-time purchase for 1 PC.',
    }
    const result = productCreateSchema.safeParse(createInput)
    expect(result.success).toBe(true)
  })

  it('validates partial updates in productUpdateSchema', () => {
    const updateInput = {
      sale_price: '299.00',
      is_active: false,
    }
    const result = productUpdateSchema.safeParse(updateInput)
    expect(result.success).toBe(true)
  })
})
