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
import type { NativeFetchClient } from './fetch-client'

export class HttpAuthAdapter implements AuthService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return this.client.request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
      skipAuth: true,
    })
  }

  async register(payload: RegisterRequest): Promise<RegisterSuccessResponse> {
    return this.client.request<RegisterSuccessResponse>('/auth/register', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    })
  }

  async loginWithGoogle(payload: GoogleLoginRequest): Promise<TokenResponse> {
    return this.client.request<TokenResponse>('/auth/login/google', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    })
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return this.client.request<TokenResponse>('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
      skipAuth: true,
    })
  }

  async logout(refreshToken?: string): Promise<LogoutResponse> {
    return this.client.request<LogoutResponse>('/auth/logout', {
      method: 'POST',
      body: { refresh_token: refreshToken ?? '' },
    })
  }

  async requestPasswordReset(payload: PasswordResetRequest): Promise<PasswordResetRequestResponse> {
    return this.client.request<PasswordResetRequestResponse>('/auth/password/reset-request', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    })
  }

  async confirmPasswordReset(payload: PasswordResetConfirm): Promise<PasswordResetConfirmResponse> {
    return this.client.request<PasswordResetConfirmResponse>('/auth/password/reset-confirm', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    })
  }

  async requestOtp(payload: OTPRequest): Promise<OTPRequestResponse> {
    return this.client.request<OTPRequestResponse>('/auth/otp/request', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    })
  }

  async verifyOtp(payload: OTPVerify): Promise<OTPVerifyResponse> {
    return this.client.request<OTPVerifyResponse>('/auth/otp/verify', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    })
  }

  async adminLogin(credentials: LoginRequest): Promise<TokenResponse> {
    return this.client.request<TokenResponse>('/auth/admin/login', {
      method: 'POST',
      body: credentials,
      skipAuth: true,
    })
  }
}
