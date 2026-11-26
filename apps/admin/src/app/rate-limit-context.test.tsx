import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RateLimitProvider } from '../app/rate-limit-context'
import { useRateLimitCooldown } from '../hooks/use-rate-limit-cooldown'

describe('RateLimitProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts down cooldown seconds, extends overlapping deadlines, and clears cleanly', () => {
    const { result } = renderHook(() => useRateLimitCooldown(), {
      wrapper: RateLimitProvider,
    })

    expect(result.current.isLimited).toBe(false)
    expect(result.current.remainingSeconds).toBe(0)

    act(() => {
      result.current.triggerCooldown(5)
    })

    expect(result.current.isLimited).toBe(true)
    expect(result.current.remainingSeconds).toBe(5)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.remainingSeconds).toBe(3)

    // Overlapping longer cooldown extends rather than shortens
    act(() => {
      result.current.triggerCooldown(10)
    })
    expect(result.current.remainingSeconds).toBe(10)

    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(result.current.isLimited).toBe(false)
    expect(result.current.remainingSeconds).toBe(0)
  })

  it('resets immediately when clearCooldown is called', () => {
    const { result } = renderHook(() => useRateLimitCooldown(), {
      wrapper: RateLimitProvider,
    })

    act(() => {
      result.current.triggerCooldown(60)
    })
    expect(result.current.isLimited).toBe(true)

    act(() => {
      result.current.clearCooldown()
    })
    expect(result.current.isLimited).toBe(false)
    expect(result.current.remainingSeconds).toBe(0)
  })
})
