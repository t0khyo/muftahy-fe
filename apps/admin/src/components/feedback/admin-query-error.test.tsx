import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import { AdminQueryError } from './admin-query-error'

describe('AdminQueryError', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('renders localized message and calls onRetry in English and Arabic', async () => {
    const onRetry = vi.fn()
    const err = new ApiClientError(500, 'SERVER_ERROR', 'Internal crash')

    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <AdminQueryError error={err} onRetry={onRetry} />
      </I18nextProvider>,
    )

    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    expect(screen.getByText('A server error occurred. Please try again in a moment.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)

    await act(async () => {
      await i18n.changeLanguage('ar')
    })
    rerender(
      <I18nextProvider i18n={i18n}>
        <AdminQueryError error={err} onRetry={onRetry} />
      </I18nextProvider>,
    )
    expect(screen.getByText('تعذر تحميل البيانات')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'إعادة المحاولة' })).toBeInTheDocument()
  })

  it('disables Retry when retrying or during cooldown and shows Back link on 403/404', () => {
    const onRetry = vi.fn()
    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <AdminQueryError
          error={new ApiClientError(429, 'RATE_LIMIT_EXCEEDED', 'limit', {}, 25)}
          onRetry={onRetry}
          cooldownSeconds={25}
          variant="compact"
        />
      </I18nextProvider>,
    )

    const cooldownBtn = screen.getByRole('button', { name: 'Retry in 25s' })
    expect(cooldownBtn).toBeDisabled()

    rerender(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/en/orders']}>
          <Routes>
            <Route
              path="/:lang/*"
              element={<AdminQueryError error={new ApiClientError(403, 'PERMISSION_DENIED', 'Forbidden')} />}
            />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    )

    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
    const backLink = screen.getByRole('button', { name: 'Back to Dashboard' })
    expect(backLink).toHaveAttribute('href', '/en')
  })
})
