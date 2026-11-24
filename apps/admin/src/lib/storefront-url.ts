/**
 * Resolves a storefront relative path to a full URL based on the environment.
 * In development, defaults to http://localhost:5173 if VITE_STOREFRONT_URL is unset.
 */
export function getStorefrontUrl(path: string): string {
  const envUrl = import.meta.env.VITE_STOREFRONT_URL
  const baseUrl = envUrl !== undefined && envUrl !== '' ? envUrl : import.meta.env.DEV ? 'http://localhost:5173' : ''
  const cleanBase = baseUrl.replace(/\/+$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return cleanBase ? `${cleanBase}${cleanPath}` : cleanPath
}

