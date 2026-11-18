import { AccountGuard } from '../features/account/components/account-guard'
import { AccountLayout } from '../features/account/components/account-layout'

export function AccountLayoutRoute() {
  return (
    <AccountGuard>
      <AccountLayout />
    </AccountGuard>
  )
}
