import { render } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import type { ProductImageResponse } from '@workspace/domain/schemas/product'
import { ProductMediaSection, type StagedImage } from './product-media-section'

vi.mock(import('@workspace/api/factory'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    resolveStorageUrl: vi.fn((val: string | null | undefined) => {
      if (!val) return null
      if (val.startsWith('http')) return val
      if (val.startsWith('/storage/') || val.startsWith('products/')) {
        return `http://localhost:8000${val.startsWith('/') ? '' : '/'}${val}`
      }
      return val
    }),
  }
})

describe('ProductMediaSection', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    })
  })

  function renderMediaSection(props: Partial<React.ComponentProps<typeof ProductMediaSection>> = {}) {
    return render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <ProductMediaSection {...props} />
        </QueryClientProvider>
      </I18nextProvider>,
    )
  }

  it('renders live product images using resolved URLs when url is a relative path', () => {
    const liveImages: ProductImageResponse[] = [
      {
        id: 'img-1',
        file_path: 'products/sample-1.webp',
        file_size: 1024,
        mime_type: 'image/webp',
        url: '/storage/products/sample-1.webp',
        display_order: 0,
        is_primary: true,
      },
      {
        id: 'img-2',
        file_path: 'products/sample-2.webp',
        file_size: 2048,
        mime_type: 'image/webp',
        url: '/storage/products/sample-2.webp',
        display_order: 1,
        is_primary: false,
      },
    ]

    const { container } = renderMediaSection({
      productId: 'prod-123',
      liveImages,
    })

    const renderedImgs = container.querySelectorAll('img')
    expect(renderedImgs).toHaveLength(2)
    expect(renderedImgs[0]).toHaveAttribute('src', 'http://localhost:8000/storage/products/sample-1.webp')
    expect(renderedImgs[1]).toHaveAttribute('src', 'http://localhost:8000/storage/products/sample-2.webp')
  })

  it('renders staged images with blob preview URLs for new product creation', () => {
    const stagedImages: StagedImage[] = [
      {
        id: 'staged-1',
        file: new File(['dummy'], 'test.png', { type: 'image/png' }),
        previewUrl: 'blob:http://localhost:5174/preview-uuid-1',
        is_primary: true,
      },
    ]

    const { container } = renderMediaSection({
      stagedImages,
    })

    const renderedImgs = container.querySelectorAll('img')
    expect(renderedImgs).toHaveLength(1)
    expect(renderedImgs[0]).toHaveAttribute('src', 'blob:http://localhost:5174/preview-uuid-1')
  })

  it('renders dedicated catalog thumbnail preview when thumbnailUrl is provided', () => {
    const { container } = renderMediaSection({
      productId: 'prod-123',
      thumbnailUrl: '/storage/products/thumbnails/prod-123_abc.webp',
      liveImages: [],
    })

    const renderedImgs = container.querySelectorAll('img')
    expect(renderedImgs).toHaveLength(1)
    expect(renderedImgs[0]).toHaveAttribute(
      'src',
      'http://localhost:8000/storage/products/thumbnails/prod-123_abc.webp',
    )
  })
})
