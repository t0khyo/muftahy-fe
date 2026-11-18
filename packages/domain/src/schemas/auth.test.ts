import { describe, expect, it } from 'vitest'
import {
  apiErrorResponseSchema,
  googleLoginRequestSchema,
  loginRequestSchema,
  otpRequestSchema,
  otpVerifySchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  registerRequestSchema,
  tokenResponseSchema,
  updateProfileRequestSchema,
  userProfileSchema,
} from './auth'

describe('auth schemas', () => {
  describe('loginRequestSchema', () => {
    it('validates and normalizes valid credentials', () => {
      const result = loginRequestSchema.safeParse({
        email: '  CUSTOMER@Example.COM  ',
        password: 'Password123!',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('customer@example.com')
        expect(result.data.password).toBe('Password123!')
      }
    })

    it('rejects invalid email formats', () => {
      const result = loginRequestSchema.safeParse({
        email: 'not-an-email',
        password: 'Password123!',
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty password', () => {
      const result = loginRequestSchema.safeParse({
        email: 'customer@example.com',
        password: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('registerRequestSchema', () => {
    it('validates a complete registration request', () => {
      const result = registerRequestSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePassword123!',
        full_name: 'Ahmed Mohamed',
        phone: '01012345678',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.full_name).toBe('Ahmed Mohamed')
        expect(result.data.phone).toBe('01012345678')
      }
    })

    it('rejects passwords shorter than 8 characters', () => {
      const result = registerRequestSchema.safeParse({
        email: 'user@example.com',
        password: 'short',
        full_name: 'Ahmed Mohamed',
      })
      expect(result.success).toBe(false)
    })

    it('rejects full names shorter than 2 characters', () => {
      const result = registerRequestSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePassword123!',
        full_name: 'A',
      })
      expect(result.success).toBe(false)
    })

    it('allows null or omitted phone number', () => {
      const withNull = registerRequestSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePassword123!',
        full_name: 'Ahmed Mohamed',
        phone: null,
      })
      expect(withNull.success).toBe(true)

      const withOmitted = registerRequestSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePassword123!',
        full_name: 'Ahmed Mohamed',
      })
      expect(withOmitted.success).toBe(true)
    })
  })

  describe('updateProfileRequestSchema', () => {
    it('validates partial profile updates', () => {
      const result = updateProfileRequestSchema.safeParse({
        full_name: 'Ahmed H. Ali',
        phone: '+201098765432',
      })
      expect(result.success).toBe(true)
    })

    it('allows empty object for partial updates', () => {
      const result = updateProfileRequestSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('rejects full name shorter than 2 characters', () => {
      const result = updateProfileRequestSchema.safeParse({
        full_name: 'X',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('googleLoginRequestSchema', () => {
    it('validates non-empty authorization code', () => {
      const result = googleLoginRequestSchema.safeParse({
        code: '4/0AeanS0bXYZ123456789_sample_code',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty authorization code', () => {
      const result = googleLoginRequestSchema.safeParse({
        code: '   ',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('tokenResponseSchema', () => {
    it('validates standard bearer token responses', () => {
      const result = tokenResponseSchema.safeParse({
        access_token: 'jwt.access.token',
        refresh_token: 'uuid-refresh-token',
        token_type: 'bearer',
        expires_in: 900,
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid token_type', () => {
      const result = tokenResponseSchema.safeParse({
        access_token: 'jwt.access.token',
        refresh_token: 'uuid-refresh-token',
        token_type: 'mac',
        expires_in: 900,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('OTP & Password Reset Schemas', () => {
    it('validates password reset request', () => {
      const result = passwordResetRequestSchema.safeParse({
        email: 'customer@example.com',
      })
      expect(result.success).toBe(true)
    })

    it('validates password reset confirmation with 6-digit code', () => {
      const result = passwordResetConfirmSchema.safeParse({
        email: 'customer@example.com',
        code: '123456',
        new_password: 'NewStrongPassword123!',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid OTP code lengths or non-digit characters', () => {
      expect(
        passwordResetConfirmSchema.safeParse({
          email: 'customer@example.com',
          code: '12345',
          new_password: 'NewStrongPassword123!',
        }).success
      ).toBe(false)

      expect(
        passwordResetConfirmSchema.safeParse({
          email: 'customer@example.com',
          code: '12345a',
          new_password: 'NewStrongPassword123!',
        }).success
      ).toBe(false)
    })

    it('validates OTP request and OTP verify schemas', () => {
      expect(
        otpRequestSchema.safeParse({
          email: 'customer@example.com',
        }).success
      ).toBe(true)

      expect(
        otpVerifySchema.safeParse({
          email: 'customer@example.com',
          code: '654321',
        }).success
      ).toBe(true)
    })
  })

  describe('userProfileSchema', () => {
    it('validates full user profile', () => {
      const result = userProfileSchema.safeParse({
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        email: 'customer@example.com',
        full_name: 'Ahmed Mohamed',
        phone: '01012345678',
        is_active: true,
        created_at: '2026-11-16T12:00:00Z',
      })
      expect(result.success).toBe(true)
    })

    it('defaults is_active to true when omitted', () => {
      const result = userProfileSchema.safeParse({
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        email: 'customer@example.com',
        full_name: 'Ahmed Mohamed',
        created_at: '2026-11-16T12:00:00Z',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.is_active).toBe(true)
      }
    })
  })

  describe('apiErrorResponseSchema', () => {
    it('validates API error responses with default details', () => {
      const result = apiErrorResponseSchema.safeParse({
        error_code: 'AUTHENTICATION_FAILED',
        message: 'Invalid credentials',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.details).toEqual({})
      }
    })

    it('parses retry_after header numeric value', () => {
      const result = apiErrorResponseSchema.safeParse({
        error_code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        retry_after: 60,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.retry_after).toBe(60)
      }
    })
  })
})
