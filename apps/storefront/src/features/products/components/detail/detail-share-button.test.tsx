import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { TooltipProvider } from '@workspace/ui/components/tooltip'
import { toast } from '@workspace/ui/components/sonner'
import { DetailShareButton } from './detail-share-button'

function renderShareButton(props = { productName: 'Windows 11 Pro', productDescription: 'Retail license key' }) {
  return render(
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <DetailShareButton {...props} />
      </TooltipProvider>
    </I18nextProvider>,
  )
}

describe('DetailShareButton', () => {
  const originalShare = navigator.share
  const originalClipboard = navigator.clipboard

  afterEach(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      writable: true,
      value: originalShare,
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: originalClipboard,
    })
    vi.restoreAllMocks()
  })

  it('uses navigator.share when available and skips clipboard copy', async () => {
    await i18n.changeLanguage('en')
    const shareMock = vi.fn().mockResolvedValue(undefined)
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: shareMock })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText: writeTextMock },
    })

    renderShareButton()
    fireEvent.click(screen.getByRole('button', { name: 'Share product' }))

    await waitFor(() => {
      expect(shareMock).toHaveBeenCalledWith({
        title: 'Windows 11 Pro',
        text: 'Retail license key',
        url: window.location.href,
      })
    })
    expect(writeTextMock).not.toHaveBeenCalled()
  })

  it('silently ignores AbortError when user cancels native share', async () => {
    await i18n.changeLanguage('en')
    const abortError = new DOMException('Share canceled', 'AbortError')
    const shareMock = vi.fn().mockRejectedValue(abortError)
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    const errorSpy = vi.spyOn(toast, 'error').mockImplementation(() => '1')

    Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: shareMock })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText: writeTextMock },
    })

    renderShareButton()
    fireEvent.click(screen.getByRole('button', { name: 'Share product' }))

    await waitFor(() => {
      expect(shareMock).toHaveBeenCalled()
    })
    expect(writeTextMock).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('falls back to clipboard copy and shows success toast when navigator.share is unavailable', async () => {
    await i18n.changeLanguage('en')
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    const successSpy = vi.spyOn(toast, 'success').mockImplementation(() => '1')

    Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: undefined })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText: writeTextMock },
    })

    renderShareButton()
    fireEvent.click(screen.getByRole('button', { name: 'Share product' }))

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(window.location.href)
      expect(successSpy).toHaveBeenCalledWith('Product link copied')
      expect(screen.getByRole('button', { name: 'Product link copied' })).toBeInTheDocument()
    })
  })

  it('shows error toast if clipboard copy fails', async () => {
    await i18n.changeLanguage('en')
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'))
    const errorSpy = vi.spyOn(toast, 'error').mockImplementation(() => '1')

    Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: undefined })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText: writeTextMock },
    })

    renderShareButton()
    fireEvent.click(screen.getByRole('button', { name: 'Share product' }))

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith('Could not copy link')
    })
  })

  it('renders Arabic accessible label and copied toast in Arabic locale', async () => {
    await i18n.changeLanguage('ar')
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    const successSpy = vi.spyOn(toast, 'success').mockImplementation(() => '1')

    Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: undefined })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText: writeTextMock },
    })

    renderShareButton()
    fireEvent.click(screen.getByRole('button', { name: 'مشاركة المنتج' }))

    await waitFor(() => {
      expect(successSpy).toHaveBeenCalledWith('تم نسخ رابط المنتج')
      expect(screen.getByRole('button', { name: 'تم نسخ رابط المنتج' })).toBeInTheDocument()
    })
  })
})

