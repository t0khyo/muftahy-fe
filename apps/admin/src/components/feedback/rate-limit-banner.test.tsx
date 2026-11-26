import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { RateLimitProvider } from '../../app/rate-limit-context'
import { useRateLimitCooldown } from '../../hooks/use-rate-limit-cooldown'
import { RateLimitBanner } from './rate-limit-banner'

function TestHarness() {
  const { triggerCooldown } = useRateLimitCooldown()
  return (
    <>
      <button type="button" onClick={() => triggerCooldown(12)}>
        Trigger
      </button>
      <RateLimitBanner />
    </>
  )
}

describe('RateLimitBanner', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    await i18n.changeLanguage('en')
  })

  afterEach(async () => {
    vi.useRealTimers()
    await i18n.changeLanguage('en')
  })

  it('displays live Western-digit countdown in EN and AR and hides upon expiry', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <RateLimitProvider>
          <TestHarness />
        </RateLimitProvider>
      </I18nextProvider>,
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    act(() => {
      screen.getByRole('button', { name: 'Trigger' }).click()
    })

    expect(screen.getByRole('status')).toHaveTextContent('Requests are paused for 12s')

    await act(async () => {
      await i18n.changeLanguage('ar')
    })
    expect(screen.getByRole('status')).toHaveTextContent('12')
    expect(screen.getByRole('status').textContent).not.toMatch(/[٠-٩]/)

    act(() => {
      vi.advanceTimersByTime(12000)
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
