interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_TEST_WITH_LIVE_API?: string
  readonly API_URL?: string
  readonly MODE?: string
  [key: string]: string | undefined
}

interface ImportMeta {
  readonly env?: ImportMetaEnv
}

