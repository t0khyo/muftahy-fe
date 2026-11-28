/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_WHATSAPP_NUMBER?: string
  readonly VITE_SUPPORT_EMAIL?: string
  readonly VITE_SOCIAL_INSTAGRAM_URL?: string
  readonly VITE_SOCIAL_FACEBOOK_URL?: string
  readonly VITE_SOCIAL_HANDLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
