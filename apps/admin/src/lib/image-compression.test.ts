import { describe, expect, it, vi, beforeEach } from 'vitest'
import imageCompression from 'browser-image-compression'
import { compressProductImage, PRODUCT_IMAGE_COMPRESSION_OPTIONS } from './image-compression'

vi.mock('browser-image-compression', () => {
  return {
    default: vi.fn(),
  }
})

describe('compressProductImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('compresses a JPG file to WebP with target settings (1920px, 0.8 quality)', async () => {
    const originalFile = new File(['dummy-content-12345'], 'box-art.jpg', {
      type: 'image/jpeg',
    })

    const mockCompressedBlob = new Blob(['compressed-webp-bytes'], { type: 'image/webp' })
    vi.mocked(imageCompression).mockResolvedValue(mockCompressedBlob as File)

    const result = await compressProductImage(originalFile)

    expect(imageCompression).toHaveBeenCalledWith(originalFile, PRODUCT_IMAGE_COMPRESSION_OPTIONS)
    expect(result.name).toBe('box-art.webp')
    expect(result.type).toBe('image/webp')
  })

  it('skips compression for already small WebP files', async () => {
    const smallWebpFile = new File(['small'], 'already-small.webp', {
      type: 'image/webp',
    })

    const result = await compressProductImage(smallWebpFile)

    expect(imageCompression).not.toHaveBeenCalled()
    expect(result).toBe(smallWebpFile)
  })

  it('falls back to the original file if compression throws', async () => {
    const originalFile = new File(['corrupt-or-unsupported'], 'artwork.png', {
      type: 'image/png',
    })

    vi.mocked(imageCompression).mockRejectedValue(new Error('Canvas worker error'))

    const result = await compressProductImage(originalFile)

    expect(result).toBe(originalFile)
    expect(result.name).toBe('artwork.png')
  })
})

