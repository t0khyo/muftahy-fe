import type {
  GoogleLoginRequest,
  LoginRequest,
  LogoutResponse,
  OTPRequest,
  OTPRequestResponse,
  OTPVerify,
  OTPVerifyResponse,
  PasswordResetConfirm,
  PasswordResetConfirmResponse,
  PasswordResetRequest,
  PasswordResetRequestResponse,
  RegisterRequest,
  RegisterSuccessResponse,
  TokenResponse,
} from '@workspace/domain/schemas/auth'
import type { AuthService } from '../../services/auth-service'
import { ApiClientError } from '../http/fetch-client'

function toBase64Url(jsonStr: string): string {
  let base64 = ''
  if (typeof btoa === 'function') {
    base64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
  } else if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(jsonStr).toString('base64')
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function generateMockJwt(sub: string, aud: 'customer' | 'admin', expiresInSeconds = 900): string {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = toBase64Url(
    JSON.stringify({
      sub,
      aud,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    })
  )
  return `${header}.${payload}.mock_sig`
}

interface MockUserRecord {
  id: string
  email: string
  password: string
  full_name: string
  phone?: string | null
  aud: 'customer' | 'admin'
}

export class MockAuthAdapter implements AuthService {
  private users: Map<string, MockUserRecord> = new Map([
    [
      'customer@example.com',
      {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        email: 'customer@example.com',
        password: 'SecurePassword123!',
        full_name: 'Ahmed Mohamed',
        phone: '01012345678',
        aud: 'customer',
      },
    ],
    [
      'admin1@souqmuftah.com',
      {
        id: '55024a5b-9c0d-4d16-a04c-4f5d782e4256',
        email: 'admin1@souqmuftah.com',
        password: 'change-me-immediately-1',
        full_name: 'System Admin',
        phone: null,
        aud: 'admin',
      },
    ],
    [
      'abdelrahman.m.eltokhy@gmail.com',
      {
        id: '7e99f920-2d9a-4e6f-8d22-d5b39d1e0727',
        email: 'abdelrahman.m.eltokhy@gmail.com',
        password: 'abdelrahman123',
        full_name: 'Abdelrahman ElTokhy',
        phone: null,
        aud: 'admin',
      },
    ],
  ])

  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const email = credentials.email.trim().toLowerCase()
    const user = this.users.get(email)

    if (!user || user.password !== credentials.password || user.aud !== 'customer') {
      throw new ApiClientError(401, 'AUTHENTICATION_FAILED', 'Invalid email or password')
    }

    return {
      access_token: generateMockJwt(user.id, 'customer'),
      refresh_token: `mock-refresh-${user.id}-${Date.now()}`,
      token_type: 'bearer',
      expires_in: 900,
    }
  }

  async register(payload: RegisterRequest): Promise<RegisterSuccessResponse> {
    const email = payload.email.trim().toLowerCase()
    if (this.users.has(email)) {
      throw new ApiClientError(400, 'EMAIL_ALREADY_EXISTS', 'Email already registered')
    }

    const userId = `user-${Date.now()}`
    this.users.set(email, {
      id: userId,
      email,
      password: payload.password,
      full_name: payload.full_name,
      phone: payload.phone,
      aud: 'customer',
    })

    return {
      status: 'success',
      message: 'User registered successfully',
      user_id: userId,
    }
  }

  async loginWithGoogle(payload: GoogleLoginRequest): Promise<TokenResponse> {
    if (!payload.code) {
      throw new ApiClientError(400, 'INVALID_REQUEST', 'Authorization code is required')
    }

    const email = 'google.user@example.com'
    let user = this.users.get(email)
    if (!user) {
      user = {
        id: 'google-user-001',
        email,
        password: 'GoogleOAuthUser!',
        full_name: 'Google Customer',
        phone: null,
        aud: 'customer',
      }
      this.users.set(email, user)
    }

    return {
      access_token: generateMockJwt(user.id, 'customer'),
      refresh_token: `mock-refresh-google-${Date.now()}`,
      token_type: 'bearer',
      expires_in: 900,
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    if (!refreshToken || refreshToken.includes('invalid')) {
      throw new ApiClientError(401, 'AUTHENTICATION_FAILED', 'Invalid refresh token')
    }

    return {
      access_token: generateMockJwt('user-refreshed', 'customer'),
      refresh_token: `mock-refresh-rotated-${Date.now()}`,
      token_type: 'bearer',
      expires_in: 900,
    }
  }

  async logout(_refreshToken?: string): Promise<LogoutResponse> {
    return {
      status: 'success',
      message: 'Successfully logged out',
    }
  }

  async requestPasswordReset(_payload: PasswordResetRequest): Promise<PasswordResetRequestResponse> {
    return {
      message: 'If this email is registered, a 6-digit verification code has been sent.',
      reset_token: null,
    }
  }

  async confirmPasswordReset(payload: PasswordResetConfirm): Promise<PasswordResetConfirmResponse> {
    if (payload.code !== '123456' && payload.code !== '456789') {
      throw new ApiClientError(400, 'INVALID_CREDENTIALS', 'Incorrect or expired verification code')
    }

    const email = payload.email.trim().toLowerCase()
    const user = this.users.get(email)
    if (user) {
      user.password = payload.new_password
    }

    return {
      status: 'success',
      message: 'Password updated successfully',
    }
  }

  async requestOtp(_payload: OTPRequest): Promise<OTPRequestResponse> {
    return {
      message: 'Verification code sent to your email.',
      cooldown_seconds: 60,
    }
  }

  async verifyOtp(payload: OTPVerify): Promise<OTPVerifyResponse> {
    if (payload.code !== '123456' && payload.code !== '654321') {
      throw new ApiClientError(400, 'INVALID_CREDENTIALS', 'Incorrect verification code')
    }

    return {
      message: 'Verification code verified successfully.',
      otp_token: 'mock-otp-token',
    }
  }

  async adminLogin(credentials: LoginRequest): Promise<TokenResponse> {
    const email = credentials.email.trim().toLowerCase()
    const user = this.users.get(email)

    if (!user || user.password !== credentials.password || user.aud !== 'admin') {
      throw new ApiClientError(401, 'AUTHENTICATION_FAILED', 'Invalid email or password')
    }

    return {
      access_token: generateMockJwt(user.id, 'admin'),
      refresh_token: `mock-admin-refresh-${Date.now()}`,
      token_type: 'bearer',
      expires_in: 900,
    }
  }
}
