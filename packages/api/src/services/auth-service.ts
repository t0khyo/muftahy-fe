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

export interface AuthService {
  login(credentials: LoginRequest): Promise<TokenResponse>
  register(payload: RegisterRequest): Promise<RegisterSuccessResponse>
  loginWithGoogle(payload: GoogleLoginRequest): Promise<TokenResponse>
  refreshToken(refreshToken: string): Promise<TokenResponse>
  logout(refreshToken?: string): Promise<LogoutResponse>
  requestPasswordReset(payload: PasswordResetRequest): Promise<PasswordResetRequestResponse>
  confirmPasswordReset(payload: PasswordResetConfirm): Promise<PasswordResetConfirmResponse>
  requestOtp(payload: OTPRequest): Promise<OTPRequestResponse>
  verifyOtp(payload: OTPVerify): Promise<OTPVerifyResponse>
  adminLogin(credentials: LoginRequest): Promise<TokenResponse>
}
