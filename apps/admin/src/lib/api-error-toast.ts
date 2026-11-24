import { toast } from '@workspace/ui/components/sonner'
import i18next from 'i18next'

export function showApiErrorToast(error: unknown, fallbackKey = 'admin:errors.GENERIC_ERROR') {
  let message: string = i18next.t(fallbackKey as unknown as TemplateStringsArray, { defaultValue: 'An unexpected error occurred' })

  if (error && typeof error === 'object') {
    const errObj = error as { code?: string; message?: string }
    if (errObj.code) {
      const translationKey = `admin:errors.${errObj.code}`
      const translated = i18next.t(translationKey as unknown as TemplateStringsArray)
      if (translated && typeof translated === 'string' && translated !== translationKey) {
        message = translated
      } else if (errObj.message) {
        message = errObj.message
      }
    } else if (errObj.message) {
      message = errObj.message
    }
  } else if (error instanceof Error) {
    message = error.message
  }

  toast.error(message)
}

