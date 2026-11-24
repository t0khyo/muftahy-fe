import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  compressImage,
  compressProductImage,
  compressReceipt,
  compressThumbnail,
  DEFAULT_IMAGE_COMPRESSION_OPTIONS,
  PRODUCT_IMAGE_COMPRESSION_OPTIONS,
  RECEIPT_COMPRESSION_OPTIONS,
  THUMBNAIL_COMPRESSION_OPTIONS,
} from './image-compression'
import imageCompression from 'browser-image-compression'

vi.mock('browser-image-compression', () => ({
  default: vi.fn(),
}))

describe('compressImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('compresses file to WebP with default options', async () => {
    const mockBlob = new Blob(['compressed-content'], { type: 'image/webp' })
    vi.mocked(imageCompression).mockResolvedValue(mockBlob as unknown as File)

    const rawFile = new File(['raw-image-content'], 'receipt.jpg', {
      type: 'image/jpeg',
    })

    const result = await compressImage(rawFile)

    expect(imageCompression).toHaveBeenCalledWith(
      rawFile,
      DEFAULT_IMAGE_COMPRESSION_OPTIONS
    )
    expect(result.name).toBe('receipt.webp')
    expect(result.type).toBe('image/webp')
  })

  it('skips compression if already small WebP file', async () => {
    const smallWebpFile = new File(['webp-content'], 'avatar.webp', {
      type: 'image/webp',
    })
    Object.defineProperty(smallWebpFile, 'size', { value: 100 * 1024 })

    const result = await compressImage(smallWebpFile)

    expect(imageCompression).not.toHaveBeenCalled()
    expect(result).toBe(smallWebpFile)
  })

  it('falls back to original file if compression throws error', async () => {
    vi.mocked(imageCompression).mockRejectedValue(new Error('Worker crashed'))

    const rawFile = new File(['raw-image-content'], 'defect.png', {
      type: 'image/png',
    })

    const result = await compressImage(rawFile)

    expect(result).toBe(rawFile)
  })

  it('compressProductImage falls back to 1920px WebP preset when canvas is unavailable', async () => {
    const mockBlob = new Blob(['gallery-webp'], { type: 'image/webp' })
    vi.mocked(imageCompression).mockResolvedValue(mockBlob as unknown as File)

    const rawFile = new File(['raw'], 'box.png', { type: 'image/png' })
    const result = await compressProductImage(rawFile)

    expect(imageCompression).toHaveBeenCalledWith(rawFile, PRODUCT_IMAGE_COMPRESSION_OPTIONS)
    expect(result.name).toBe('box.webp')
    expect(result.type).toBe('image/webp')
  })

  it('compressThumbnail falls back to 480px WebP preset when canvas is unavailable', async () => {
    const mockBlob = new Blob(['thumb-webp'], { type: 'image/webp' })
    vi.mocked(imageCompression).mockResolvedValue(mockBlob as unknown as File)

    const rawFile = new File(['raw'], 'box.jpg', { type: 'image/jpeg' })
    const result = await compressThumbnail(rawFile)

    expect(imageCompression).toHaveBeenCalledWith(rawFile, THUMBNAIL_COMPRESSION_OPTIONS)
    expect(result.name).toBe('box.webp')
    expect(result.type).toBe('image/webp')
  })

  it('compressReceipt uses uncropped 1920px Q85 500KB WebP preset for mobile screenshots', async () => {
    const mockBlob = new Blob(['receipt-webp'], { type: 'image/webp' })
    vi.mocked(imageCompression).mockResolvedValue(mockBlob as unknown as File)

    const rawFile = new File(['raw-screenshot'], 'instapay-receipt.png', {
      type: 'image/png',
    })
    const result = await compressReceipt(rawFile)

    expect(imageCompression).toHaveBeenCalledWith(rawFile, RECEIPT_COMPRESSION_OPTIONS)
    expect(result.name).toBe('instapay-receipt.webp')
    expect(result.type).toBe('image/webp')
  })

  it('compressReceipt skips re-compression for already small WebP receipts', async () => {
    const smallWebp = new File(['webp'], 'receipt.webp', { type: 'image/webp' })
    Object.defineProperty(smallWebp, 'size', { value: 200 * 1024 })

    const result = await compressReceipt(smallWebp)

    expect(imageCompression).not.toHaveBeenCalled()
    expect(result).toBe(smallWebp)
  })
})

