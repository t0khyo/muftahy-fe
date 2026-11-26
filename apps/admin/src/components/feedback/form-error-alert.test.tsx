import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import { FormErrorAlert } from './form-error-alert'

describe('FormErrorAlert', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('renders null when empty or when error is a 500 server error', () => {
    const { container, rerender } = render(
      <I18nextProvider i18n={i18n}>
        <FormErrorAlert error={null} />
      </I18nextProvider>,
    )
    expect(container.firstChild).toBeNull()

    rerender(
      <I18nextProvider i18n={i18n}>
        <FormErrorAlert error={new ApiClientError(500, 'SERVER_ERROR', 'Crash')} />
      </I18nextProvider>,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders clientError and 409/422 inline field errors in EN and AR', async () => {
    const err422 = new ApiClientError(422, 'VALIDATION_ERROR', 'Validation error', undefined, undefined, {
      fieldErrors: [{ field: 'sku', message: 'SKU format invalid' }],
    })

    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <FormErrorAlert error={err422} />
      </I18nextProvider>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Please check the highlighted fields and try again.')).toBeInTheDocument()
    expect(screen.getByText('SKU format invalid')).toBeInTheDocument()

    await act(async () => {
      await i18n.changeLanguage('ar')
    })
    rerender(
      <I18nextProvider i18n={i18n}>
        <FormErrorAlert clientError="رمز التصنيف مطلوب" />
      </I18nextProvider>,
    )
    expect(screen.getByText('رمز التصنيف مطلوب')).toBeInTheDocument()
  })
})
