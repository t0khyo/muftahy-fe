import imageCompression from 'browser-image-compression'

export interface ImageCompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  fileType?: string
  initialQuality?: number
}

export const DEFAULT_IMAGE_COMPRESSION_OPTIONS: ImageCompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 0.8,
}

/**
 * Compresses an image file before uploading to backend:
 * - Converts to WebP format.
 * - Caps maximum dimension to 1920px.
 * - Compresses with initial quality of 0.8.
 * - Enforces 1MB size threshold.
 * - Runs asynchronously on a Web Worker.
 * - Falls back to the original file if compression fails or is aborted.
 */
export async function compressImage(
  file: File,
  customOptions?: Partial<ImageCompressionOptions>
): Promise<File> {
  // If already WebP and already small (< 400KB), return as-is
  if (file.type === 'image/webp' && file.size <= 400 * 1024) {
    return file
  }

  const options = {
    ...DEFAULT_IMAGE_COMPRESSION_OPTIONS,
    ...customOptions,
  }

  try {
    const compressedBlob = await imageCompression(file, options)

    // Ensure filename ends in .webp
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    const webpFileName = `${baseName || 'image'}.webp`

    return new File([compressedBlob], webpFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    })
  } catch (error) {
    console.warn('Image compression failed or was aborted, falling back to original file:', error)
    return file
  }
}

// Backward-compatible alias for existing product media code
export const compressProductImage = compressImage
export const PRODUCT_IMAGE_COMPRESSION_OPTIONS = DEFAULT_IMAGE_COMPRESSION_OPTIONS

