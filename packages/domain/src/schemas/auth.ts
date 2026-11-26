import { z } from 'zod'

/**
 * Common regex and primitives
 */
export const emailSchema = z.string().trim().email('Invalid email address').toLowerCase()

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits')

/**
 * Authentication Requests
 */
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(255),
  phone: z.string().trim().max(20).nullable().optional(),
})

export type RegisterRequest = z.infer<typeof registerRequestSchema>

export const updateProfileRequestSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(255).optional(),
  phone: z.string().trim().max(20).nullable().optional(),
})

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>

export const googleLoginRequestSchema = z.object({
  code: z.string().trim().min(1, 'Authorization code is required'),
})

export type GoogleLoginRequest = z.infer<typeof googleLoginRequestSchema>

export const refreshTokenRequestSchema = z.object({
  refresh_token: z.string().trim().min(1, 'Refresh token is required'),
})

export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>

export const passwordResetConfirmSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
  new_password: passwordSchema,
})

export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>

export const otpRequestSchema = z.object({
  email: emailSchema,
  purpose: z.string().trim().optional().default('verification'),
})

export type OTPRequest = z.infer<typeof otpRequestSchema>

export const otpVerifySchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
  purpose: z.string().trim().optional().default('verification'),
})

export type OTPVerify = z.infer<typeof otpVerifySchema>

/**
 * Authentication Responses & Models
 */
export const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  token_type: z.literal('bearer'),
  expires_in: z.number().int().positive(),
})

export type TokenResponse = z.infer<typeof tokenResponseSchema>

export const registerSuccessResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  user_id: z.string(),
})

export type RegisterSuccessResponse = z.infer<typeof registerSuccessResponseSchema>

export const logoutResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
})

export type LogoutResponse = z.infer<typeof logoutResponseSchema>

export const passwordResetRequestResponseSchema = z.object({
  message: z.string(),
  reset_token: z.string().nullable().optional(),
})

export type PasswordResetRequestResponse = z.infer<typeof passwordResetRequestResponseSchema>

export const passwordResetConfirmResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
})

export type PasswordResetConfirmResponse = z.infer<typeof passwordResetConfirmResponseSchema>

export const otpRequestResponseSchema = z.object({
  message: z.string(),
  cooldown_seconds: z.number().int().nonnegative().optional(),
})

export type OTPRequestResponse = z.infer<typeof otpRequestResponseSchema>

export const otpVerifyResponseSchema = z.object({
  message: z.string(),
  otp_token: z.string().nullable().optional(),
})

export type OTPVerifyResponse = z.infer<typeof otpVerifyResponseSchema>

export const userProfileSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  full_name: z.string().min(1),
  phone: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
  created_at: z.string(),
})

export type UserProfile = z.infer<typeof userProfileSchema>

/**
 * API Errors
 */
export const apiErrorCodeSchema = z.enum([
  'AUTHENTICATION_FAILED',
  'EMAIL_ALREADY_EXISTS',
  'INVALID_CREDENTIALS',
  'PERMISSION_DENIED',
  'RATE_LIMIT_EXCEEDED',
  'ENTITY_NOT_FOUND',
  'CATEGORY_CODE_ALREADY_EXISTS',
  'CATEGORY_CODE_IMMUTABLE_WITH_PRODUCTS',
  'CATEGORY_HAS_PRODUCTS',
  'SKU_ALREADY_EXISTS',
  'INVALID_SKU_FORMAT',
  'SKU_CATEGORY_MISMATCH',
  'SLUG_ALREADY_EXISTS',
  'SLUG_COLLISION_RETRY_EXHAUSTED',
  'IMAGE_NOT_PROVIDED',
  'IMAGE_LIMIT_EXCEEDED',
  'IMAGE_OWNERSHIP_MISMATCH',
  'FILE_TOO_LARGE',
  'INVALID_IMAGE_FORMAT',
  'IMAGE_TOO_LARGE',
  'INVALID_DATE_RANGE',
])

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>

export const apiErrorResponseSchema = z.object({
  error_code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional().default({}),
  retry_after: z.number().int().nonnegative().optional(),
})

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>
