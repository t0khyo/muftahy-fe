import { Navigate, useParams } from 'react-router'

export function AccountIndexRoute() {
  const { lang = 'ar' } = useParams<{ lang: string }>()
  return <Navigate to={`/${lang}/account/profile`} replace />
}
