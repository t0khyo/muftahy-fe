import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { MaskedKeyReveal } from './masked-key-reveal'

const TEST_SERIAL = 'W269N-WFGWX-YVC9B-4J6C9-T83GX'
const MASKED_SERIAL = 'W269-****-****-83GX'

function renderReveal(serial = TEST_SERIAL) {
  return render(
    <I18nextProvider i18n={i18n}>
      <MaskedKeyReveal serial={serial} />
    </I18nextProvider>,
  )
}

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

describe('MaskedKeyReveal', () => {
  beforeEach(() => {
    i18n.changeLanguage('en')
    mockReducedMotion(false)
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    mockReducedMotion(false)
  })

  it('masks the serial statically by default without cipher animation or plaintext in DOM', () => {
    const { container } = renderReveal()

    expect(screen.getByText(MASKED_SERIAL)).toBeInTheDocument()
    expect(screen.queryByText(TEST_SERIAL)).not.toBeInTheDocument()
    expect(container.querySelector('span[aria-hidden="true"]')).toBeNull()
  })

  it('scrambles on reveal, then reverse-scrambles on manual Mask click', () => {
    vi.useFakeTimers()
    renderReveal()

    // Reveal
    fireEvent.click(screen.getByRole('button', { name: /reveal/i }))

    const revealSr = screen.getByText(TEST_SERIAL)
    expect(revealSr).toHaveClass('sr-only')
    const revealVisual = revealSr.previousElementSibling
    expect(revealVisual).toHaveAttribute('aria-hidden', 'true')
    expect(revealVisual?.textContent).not.toBe(TEST_SERIAL)
    expect(revealVisual?.textContent?.length).toBe(TEST_SERIAL.length)

    act(() => {
      vi.advanceTimersByTime(TEST_SERIAL.length * 32 + 100)
    })
    expect(revealVisual?.textContent).toBe(TEST_SERIAL)

    // Hide manually
    fireEvent.click(screen.getByRole('button', { name: /mask/i }))

    // Plaintext leaves DOM immediately; cipher runs in reverse back to masked text
    expect(screen.queryByText(TEST_SERIAL)).not.toBeInTheDocument()
    const hideSr = screen.getByText('Serial key hidden')
    expect(hideSr).toHaveClass('sr-only')
    const hideVisual = hideSr.previousElementSibling
    expect(hideVisual).toHaveAttribute('aria-hidden', 'true')
    expect(hideVisual?.textContent).not.toBe(MASKED_SERIAL)
    expect(hideVisual?.textContent?.length).toBe(MASKED_SERIAL.length)

    act(() => {
      vi.advanceTimersByTime(MASKED_SERIAL.length * 24 + 100)
    })

    expect(hideVisual?.textContent).toBe(MASKED_SERIAL)
  })

  it('auto-masks with scramble animation after 15s', () => {
    vi.useFakeTimers()
    renderReveal()

    fireEvent.click(screen.getByRole('button', { name: /reveal/i }))

    act(() => {
      vi.advanceTimersByTime(15_000)
    })

    // Auto-mask immediately removes plaintext and starts hide cipher
    expect(screen.queryByText(TEST_SERIAL)).not.toBeInTheDocument()
    const hideSr = screen.getByText('Serial key hidden')
    const hideVisual = hideSr.previousElementSibling
    expect(hideVisual?.textContent).not.toBe(MASKED_SERIAL)

    act(() => {
      vi.advanceTimersByTime(MASKED_SERIAL.length * 24 + 100)
    })
    expect(hideVisual?.textContent).toBe(MASKED_SERIAL)
  })

  it('reveals and hides immediately when prefers-reduced-motion is enabled', () => {
    mockReducedMotion(true)
    renderReveal()

    fireEvent.click(screen.getByRole('button', { name: /reveal/i }))
    expect(screen.getAllByText(TEST_SERIAL)).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: /mask/i }))
    expect(screen.queryByText(TEST_SERIAL)).not.toBeInTheDocument()
    expect(screen.getByText(MASKED_SERIAL)).toBeInTheDocument()
  })

  it('supports Arabic translations on Reveal, Mask, and hidden announcement', () => {
    i18n.changeLanguage('ar')
    vi.useFakeTimers()
    renderReveal()

    fireEvent.click(screen.getByRole('button', { name: /إظهار/ }))
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    fireEvent.click(screen.getByRole('button', { name: /إخفاء/ }))
    expect(screen.getByText('تم إخفاء المفتاح التسلسلي')).toHaveClass('sr-only')
  })

  it('copies the full serial to clipboard even while masked', async () => {
    renderReveal()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy/i }))
      await Promise.resolve()
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(TEST_SERIAL)
  })
})
