import { Navigate } from 'react-router'
import { detectDeviceLanguage } from '@workspace/i18n/config'

export function CatchAllRedirect() {
  return <Navigate to={`/${detectDeviceLanguage()}`} replace />
}
