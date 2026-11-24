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

export const PRODUCT_IMAGE_COMPRESSION_OPTIONS: ImageCompressionOptions = {
  maxSizeMB: 0.6,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 0.83,
}

export const THUMBNAIL_COMPRESSION_OPTIONS: ImageCompressionOptions = {
  maxSizeMB: 0.08,
  maxWidthOrHeight: 480,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 0.85,
}

export const RECEIPT_COMPRESSION_OPTIONS: ImageCompressionOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 0.85,
}

function toWebpFileName(originalName: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '')
  return `${baseName || 'image'}.webp`
}

interface BitmapLike {
  width: number
  height: number
  close: () => void
}

interface Canvas2DContextLike {
  imageSmoothingEnabled: boolean
  imageSmoothingQuality: 'low' | 'medium' | 'high'
  drawImage: (
    image: BitmapLike,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ) => void
}

interface CanvasLike {
  width: number
  height: number
  getContext: (type: '2d') => Canvas2DContextLike | null
  toBlob: (cb: (blob: Blob | null) => void, type?: string, quality?: number) => void
}

/**
 * Center-crops and scales an image onto a 4:3 WebP canvas (`targetWidth x targetHeight`).
 * Returns `null` if browser canvas/image decoding is unavailable (e.g. headless JSDOM).
 */
async function cropTo4x3Webp(
  file: File,
  targetWidth: number,
  targetHeight: number,
  quality: number,
): Promise<File | null> {
  const g = globalThis as unknown as {
    document?: { createElement: (tag: 'canvas') => CanvasLike }
    createImageBitmap?: (source: Blob) => Promise<BitmapLike>
  }

  if (
    typeof g.document?.createElement !== 'function' ||
    typeof g.createImageBitmap !== 'function'
  ) {
    return null
  }

  let bitmap: BitmapLike | null = null
  try {
    bitmap = await g.createImageBitmap(file)
    const srcW = bitmap.width
    const srcH = bitmap.height
    if (!srcW || !srcH) return null

    const targetRatio = 4 / 3
    const srcRatio = srcW / srcH

    let sx = 0
    let sy = 0
    let sw = srcW
    let sh = srcH

    if (srcRatio > targetRatio) {
      // Source is wider than 4:3 -> crop horizontally
      sw = Math.round(srcH * targetRatio)
      sx = Math.round((srcW - sw) / 2)
    } else if (srcRatio < targetRatio) {
      // Source is taller than 4:3 -> crop vertically
      sh = Math.round(srcW / targetRatio)
      sy = Math.round((srcH - sh) / 2)
    }

    // Never upscale beyond cropped source size while keeping 4:3 ratio
    const outW = Math.min(targetWidth, sw)
    const outH = Math.round((outW * targetHeight) / targetWidth)

    const canvas = g.document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outW, outH)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/webp', quality),
    )
    if (!blob) return null

    return new File([blob], toWebpFileName(file.name), {
      type: 'image/webp',
      lastModified: Date.now(),
    })
  } catch {
    return null
  } finally {
    bitmap?.close()
  }
}

/**
 * Compresses an image file before uploading to backend (preserving original aspect ratio):
 * - Converts to WebP format.
 * - Caps maximum dimension to 1920px.
 * - Compresses with initial quality of 0.8.
 * - Enforces 1MB size threshold.
 * - Runs asynchronously on a Web Worker.
 * - Falls back to the original file if compression fails or is aborted.
 */
export async function compressImage(
  file: File,
  customOptions?: Partial<ImageCompressionOptions>,
): Promise<File> {
  // If already WebP and already small (< 400KB) and no explicit dimension override is requested, return as-is
  if (!customOptions?.maxWidthOrHeight && file.type === 'image/webp' && file.size <= 400 * 1024) {
    return file
  }

  const options = {
    ...DEFAULT_IMAGE_COMPRESSION_OPTIONS,
    ...customOptions,
  }

  try {
    const compressedBlob = await imageCompression(file, options)
    return new File([compressedBlob], toWebpFileName(file.name), {
      type: 'image/webp',
      lastModified: Date.now(),
    })
  } catch (error) {
    console.warn('Image compression failed or was aborted, falling back to original file:', error)
    return file
  }
}

/**
 * Compresses a product gallery image into an ideal 4:3 WebP (1920x1440 max, Q83).
 */
export async function compressProductImage(file: File): Promise<File> {
  const cropped = await cropTo4x3Webp(file, 1920, 1440, 0.83)
  if (cropped) {
    if (cropped.size <= 600 * 1024) return cropped
    return compressImage(cropped, PRODUCT_IMAGE_COMPRESSION_OPTIONS)
  }
  return compressImage(file, PRODUCT_IMAGE_COMPRESSION_OPTIONS)
}

/**
 * Compresses a product card thumbnail into an ideal 4:3 WebP (480x360 max, Q85).
 */
export async function compressThumbnail(file: File): Promise<File> {
  const cropped = await cropTo4x3Webp(file, 480, 360, 0.85)
  if (cropped) {
    if (cropped.size <= 80 * 1024) return cropped
    return compressImage(cropped, THUMBNAIL_COMPRESSION_OPTIONS)
  }
  return compressImage(file, THUMBNAIL_COMPRESSION_OPTIONS)
}

/**
 * Compresses a payment receipt (typically a tall mobile screenshot) without cropping:
 * - Preserves full original aspect ratio so transaction IDs, amounts, and timestamps are never cut off.
 * - Converts to WebP at 1920px max dimension, Q85 for crisp small text, and 500KB max size.
 */
export async function compressReceipt(file: File): Promise<File> {
  if (file.type === 'image/webp' && file.size <= 300 * 1024) {
    return file
  }
  return compressImage(file, RECEIPT_COMPRESSION_OPTIONS)
}
