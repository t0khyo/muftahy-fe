import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  compressImage,
  DEFAULT_IMAGE_COMPRESSION_OPTIONS,
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
})

