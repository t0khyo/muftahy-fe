import { describe, expect, it } from 'vitest'
import {
  adminProfileListResponseSchema,
  adminProfileResponseSchema,
  adminProfileUpdateSchema,
  normalizeAdminDisplayName,
} from './admin-profile'

describe('Admin Profile Schemas', () => {
  it('validates adminProfileResponseSchema and list schema', () => {
    const raw = {
      id: 'b8c4e120-5e77-4f8b-8b0c-1234567890ab',
      email: 'admin@souqmuftah.com',
      display_name: 'Lead Operator',
      role: 'admin',
      is_active: true,
      created_at: '2026-11-13T20:00:00Z',
      updated_at: '2026-11-26T14:30:00Z',
    }

    const parsed = adminProfileResponseSchema.parse(raw)
    expect(parsed.display_name).toBe('Lead Operator')
    expect(adminProfileListResponseSchema.parse([raw])).toHaveLength(1)
  })

  it('normalizes whitespace and validates valid English and Arabic display names', () => {
    expect(normalizeAdminDisplayName('  Zeyad\u00a0  Hemeda  ')).toBe('Zeyad Hemeda')
    expect(
      adminProfileUpdateSchema.safeParse({ display_name: 'Zeyad Hemeda' }).success,
    ).toBe(true)
    expect(
      adminProfileUpdateSchema.safeParse({ display_name: 'زياد حميدة' }).success,
    ).toBe(true)
  })

  it('rejects strict extra keys, control/bidi characters, HTML angle brackets, and invalid lengths', () => {
    expect(
      adminProfileUpdateSchema.safeParse({
        display_name: 'Valid Name',
        email: 'other@example.com',
      }).success,
    ).toBe(false)

    expect(
      adminProfileUpdateSchema.safeParse({
        display_name: 'Valid Name',
        phone: '+201001112222',
      }).success,
    ).toBe(false)

    for (const invalidName of [
      '',
      '   ',
      'A',
      '---',
      '<script>alert(1)</script>',
      'Bad\nName',
      'Bidi\u202eName',
    ]) {
      expect(
        adminProfileUpdateSchema.safeParse({ display_name: invalidName }).success,
      ).toBe(false)
    }
  })
})

