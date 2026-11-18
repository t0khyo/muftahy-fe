import { PlaceholderAccountPage } from '../features/account/pages/placeholder-account-page'

export interface AccountPlaceholderRouteProps {
  type: 'orders' | 'keys' | 'support'
}

export function AccountPlaceholderRoute({ type }: AccountPlaceholderRouteProps) {
  return <PlaceholderAccountPage type={type} />
}
