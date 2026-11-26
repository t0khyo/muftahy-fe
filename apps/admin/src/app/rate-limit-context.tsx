import * as React from 'react'
import { setAdminRateLimitHandler } from '@workspace/api/factory'
import { RateLimitContext, type RateLimitContextValue } from './rate-limit-context-value'

function clampCooldownSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return 60
  return Math.min(300, Math.max(1, Math.ceil(seconds)))
}

function computeRemainingSeconds(deadlineMs: number | null): number {
  if (deadlineMs === null) return 0
  return Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000))
}

export function RateLimitProvider({ children }: { children: React.ReactNode }) {
  const [deadlineMs, setDeadlineMs] = React.useState<number | null>(null)
  const [remainingSeconds, setRemainingSeconds] = React.useState<number>(0)

  const triggerCooldown = React.useCallback((seconds: number) => {
    const clamped = clampCooldownSeconds(seconds)
    const candidateDeadline = Date.now() + clamped * 1000
    setDeadlineMs((prev) => Math.max(prev ?? 0, candidateDeadline))
    setRemainingSeconds((prev) => Math.max(prev, clamped))
  }, [])

  const clearCooldown = React.useCallback(() => {
    setDeadlineMs(null)
    setRemainingSeconds(0)
  }, [])

  React.useEffect(() => {
    setAdminRateLimitHandler(triggerCooldown)
    return () => {
      setAdminRateLimitHandler(undefined)
    }
  }, [triggerCooldown])

  React.useEffect(() => {
    if (deadlineMs === null) return

    const sync = () => {
      const next = computeRemainingSeconds(deadlineMs)
      if (next <= 0) {
        setDeadlineMs(null)
        setRemainingSeconds(0)
      } else {
        setRemainingSeconds(next)
      }
    }

    const timer = window.setInterval(sync, 1000)
    return () => {
      window.clearInterval(timer)
    }
  }, [deadlineMs])

  const effectiveRemaining = deadlineMs === null ? 0 : remainingSeconds

  const value = React.useMemo<RateLimitContextValue>(
    () => ({
      isLimited: effectiveRemaining > 0,
      remainingSeconds: effectiveRemaining,
      triggerCooldown,
      clearCooldown,
    }),
    [effectiveRemaining, triggerCooldown, clearCooldown],
  )

  return <RateLimitContext.Provider value={value}>{children}</RateLimitContext.Provider>
}
