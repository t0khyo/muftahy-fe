import * as React from 'react'
import { RateLimitContext, type RateLimitContextValue } from '../app/rate-limit-context-value'

export function useRateLimitCooldown(): RateLimitContextValue {
  return React.useContext(RateLimitContext)
}

