import * as React from 'react'

export interface RateLimitContextValue {
  isLimited: boolean
  remainingSeconds: number
  triggerCooldown: (seconds: number) => void
  clearCooldown: () => void
}

export const DEFAULT_RATE_LIMIT_CONTEXT: RateLimitContextValue = {
  isLimited: false,
  remainingSeconds: 0,
  triggerCooldown: () => {},
  clearCooldown: () => {},
}

export const RateLimitContext = React.createContext<RateLimitContextValue>(
  DEFAULT_RATE_LIMIT_CONTEXT,
)

