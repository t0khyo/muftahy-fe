import { Navigate, useParams } from 'react-router'
import { isSupportedLanguage, type SupportedLanguage } from '@workspace/i18n/config'

export function CatchAllRedirect() {
  const { lang } = useParams<{ lang: string }>()
  const targetLang: SupportedLanguage = lang && isSupportedLanguage(lang) ? lang : 'en'
  return <Navigate to={`/${targetLang}`} replace />
}
