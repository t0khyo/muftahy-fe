import imageCompression from 'browser-image-compression'

export const PRODUCT_IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 0.8,
}

/**
 * Compresses an image file before uploading:
 * - Converts to WebP format.
 * - Caps maximum dimension to 1920px.
 * - Compresses with initial quality of 0.8.
 * - Falls back to the original file if compression fails or is unsupported.
 */
export async function compressProductImage(file: File): Promise<File> {
  // If already WebP and already small (< 400KB), return as-is
  if (file.type === 'image/webp' && file.size <= 400 * 1024) {
    return file
  }

  try {
    const compressedBlob = await imageCompression(file, PRODUCT_IMAGE_COMPRESSION_OPTIONS)

    // Ensure filename ends in .webp
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    const webpFileName = `${baseName || 'product-image'}.webp`

    return new File([compressedBlob], webpFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    })
  } catch (error) {
    console.warn('Image compression failed or was aborted, falling back to original file:', error)
    return file
  }
}

