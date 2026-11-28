import { useCallback, useEffect, useRef, useState } from 'react'
import { usePublicSettings } from '../../settings/hooks/use-public-settings'
import { isInAppBrowser } from '../lib/in-app-browser'

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string
            scope: string
            ux_mode?: 'popup' | 'redirect'
            callback: (response: { code?: string; error?: string }) => void
            error_callback?: (err: unknown) => void
          }) => {
            requestCode: () => void
          }
        }
      }
    }
  }
}

interface UseGoogleAuthOptions {
  onSuccess: (code: string) => void | Promise<void>
  onError?: (error: Error) => void
}

export function useGoogleAuth({ onSuccess, onError }: UseGoogleAuthOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const codeClientRef = useRef<{ requestCode: () => void } | null>(null)
  const { data: settings } = usePublicSettings()

  const clientId = settings?.google_client_id || import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  const isAvailable = Boolean(clientId) && !isInAppBrowser()
  const isInApp = isInAppBrowser()

  const loadScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('Window not available'))
      if (window.google?.accounts?.oauth2) {
        setScriptLoaded(true)
        return resolve()
      }

      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existing) {
        existing.addEventListener('load', () => {
          setScriptLoaded(true)
          resolve()
        })
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        setScriptLoaded(true)
        resolve()
      }
      script.onerror = () => reject(new Error('Failed to load Google Identity Services script'))
      document.body.appendChild(script)
    })
  }, [])

  useEffect(() => {
    if (!isAvailable || !clientId) return

    loadScript()
      .then(() => {
        if (window.google?.accounts?.oauth2 && !codeClientRef.current) {
          codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
            client_id: clientId,
            scope: 'openid email profile',
            ux_mode: 'popup',
            callback: (response) => {
              setIsLoading(false)
              if (response.code) {
                onSuccess(response.code)
              } else if (response.error) {
                onError?.(new Error(response.error))
              }
            },
            error_callback: (err) => {
              setIsLoading(false)
              onError?.(err instanceof Error ? err : new Error('Google OAuth popup closed or failed'))
            },
          })
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[useGoogleAuth]', err)
        }
      })
  }, [clientId, isAvailable, loadScript, onError, onSuccess])

  const signInWithGoogle = useCallback(() => {
    if (!isAvailable || !clientId) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[useGoogleAuth] Google Sign-In is unavailable or VITE_GOOGLE_CLIENT_ID is missing.')
      }
      return
    }

    setIsLoading(true)
    if (codeClientRef.current) {
      codeClientRef.current.requestCode()
    } else {
      loadScript()
        .then(() => {
          if (window.google?.accounts?.oauth2) {
            codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
              client_id: clientId,
              scope: 'openid email profile',
              ux_mode: 'popup',
              callback: (response) => {
                setIsLoading(false)
                if (response.code) {
                  onSuccess(response.code)
                } else if (response.error) {
                  onError?.(new Error(response.error))
                }
              },
            })
            codeClientRef.current.requestCode()
          }
        })
        .catch((err) => {
          setIsLoading(false)
          onError?.(err)
        })
    }
  }, [clientId, isAvailable, loadScript, onError, onSuccess])

  return {
    signInWithGoogle,
    isAvailable,
    isLoading,
    isInApp,
    scriptLoaded,
  }
}
