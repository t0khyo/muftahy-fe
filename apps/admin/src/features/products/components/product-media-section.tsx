import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  UploadCloud,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ImageIcon,
  Loader2,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { toast } from '@workspace/ui/components/sonner'
import { resolveStorageUrl } from '@workspace/api/factory'
import type { ProductImageResponse } from '@workspace/domain/schemas/product'
import {
  compressProductImage,
  compressThumbnail,
} from '@workspace/domain/media/image-compression'
import {
  useUploadProductImage,
  useDeleteProductImage,
  useSetPrimaryProductImage,
  useReorderProductImages,
  useUploadProductThumbnail,
  useDeleteProductThumbnail,
} from '../hooks/use-admin-products'

export interface StagedImage {
  id: string
  file: File
  previewUrl: string
  is_primary: boolean
}

export interface StagedThumbnail {
  file: File
  previewUrl: string
}

export interface ProductMediaSectionProps {
  productId?: string
  thumbnailUrl?: string | null
  liveImages?: ProductImageResponse[]
  stagedImages?: StagedImage[]
  onStagedImagesChange?: (images: StagedImage[]) => void
  stagedThumbnail?: StagedThumbnail | null
  onStagedThumbnailChange?: (thumbnail: StagedThumbnail | null) => void
}

const MAX_IMAGES = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const EMPTY_LIVE_IMAGES: ProductImageResponse[] = []
const EMPTY_STAGED_IMAGES: StagedImage[] = []

export function ProductMediaSection({
  productId,
  thumbnailUrl = null,
  liveImages = EMPTY_LIVE_IMAGES,
  stagedImages = EMPTY_STAGED_IMAGES,
  onStagedImagesChange,
  stagedThumbnail = null,
  onStagedThumbnailChange,
}: ProductMediaSectionProps) {
  const { t, i18n } = useTranslation(['admin'])
  const isRtl = i18n.language === 'ar'
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const thumbnailInputRef = React.useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)

  // Live mutation hooks
  const uploadMutation = useUploadProductImage()
  const deleteMutation = useDeleteProductImage()
  const setPrimaryMutation = useSetPrimaryProductImage()
  const reorderMutation = useReorderProductImages()
  const uploadThumbnailMutation = useUploadProductThumbnail()
  const deleteThumbnailMutation = useDeleteProductThumbnail()

  const isLive = Boolean(productId)

  // Local optimistic reorder buffer
  const [reorderedImages, setReorderedImages] = React.useState<ProductImageResponse[] | null>(null)
  const sortedLiveImages = React.useMemo(() => {
    return [...liveImages].sort((a, b) => a.display_order - b.display_order)
  }, [liveImages])

  const optimisticLiveImages = reorderedImages ?? sortedLiveImages
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalImagesCount = isLive ? optimisticLiveImages.length : stagedImages.length

  const validateFiles = (files: FileList | File[]): File[] => {
    const valid: File[] = []
    const availableSlots = MAX_IMAGES - totalImagesCount

    if (availableSlots <= 0) {
      toast.error(t('admin:errors.IMAGE_LIMIT_EXCEEDED', 'Products may have at most 10 images.'))
      return valid
    }

    const filesToConsider = Array.from(files).slice(0, availableSlots)

    for (const file of filesToConsider) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(t('admin:errors.INVALID_IMAGE_FORMAT', 'Unsupported image format. Please upload JPEG, PNG, or WebP.'))
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(t('admin:errors.FILE_TOO_LARGE', 'Image file exceeds the 5MB size limit.'))
        continue
      }
      valid.push(file)
    }

    return valid
  }

  const handleFilesSelected = async (files: FileList | File[]) => {
    const validFiles = validateFiles(files)
    if (validFiles.length === 0) return

    setIsProcessing(true)
    try {
      if (isLive && productId) {
        for (let i = 0; i < validFiles.length; i++) {
          const rawFile = validFiles[i]
          const compressedFile = await compressProductImage(rawFile)
          const isPrimary = optimisticLiveImages.length === 0 && i === 0
          try {
            await uploadMutation.mutateAsync({
              productId,
              file: compressedFile,
              isPrimary,
            })
            if (isPrimary) {
              const compressedThumb = await compressThumbnail(rawFile)
              await uploadThumbnailMutation.mutateAsync({
                productId,
                file: compressedThumb,
              })
            }
          } catch {
            // Handled by hook error toast
          }
        }
      } else {
        // Staged mode: compress before generating preview
        const newStaged: StagedImage[] = []
        for (let idx = 0; idx < validFiles.length; idx++) {
          const rawFile = validFiles[idx]
          const compressedFile = await compressProductImage(rawFile)
          const isPrimary = stagedImages.length === 0 && idx === 0 && newStaged.length === 0
          newStaged.push({
            id: `staged-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            file: compressedFile,
            previewUrl: URL.createObjectURL(compressedFile),
            is_primary: isPrimary,
          })
          if (isPrimary) {
            const compressedThumb = await compressThumbnail(rawFile)
            onStagedThumbnailChange?.({
              file: compressedThumb,
              previewUrl: URL.createObjectURL(compressedThumb),
            })
          }
        }
        onStagedImagesChange?.([...stagedImages, ...newStaged])
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files)
    }
  }

  // --- Reorder Helpers ---
  const handleMoveLive = (index: number, direction: 'earlier' | 'later') => {
    if (!productId) return
    const newImages = [...optimisticLiveImages]
    const targetIndex = direction === 'earlier' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newImages.length) return

    const [moved] = newImages.splice(index, 1)
    newImages.splice(targetIndex, 0, moved)

    // Update display orders
    const updated = newImages.map((img, order) => ({ ...img, display_order: order }))
    setReorderedImages(updated)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      reorderMutation.mutate(
        {
          productId,
          images: updated.map((img) => ({ image_id: img.id, display_order: img.display_order })),
        },
        {
          onSettled: () => {
            setReorderedImages(null)
          },
        },
      )
    }, 500)
  }

  const handleMoveStaged = (index: number, direction: 'earlier' | 'later') => {
    const newStaged = [...stagedImages]
    const targetIndex = direction === 'earlier' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newStaged.length) return

    const [moved] = newStaged.splice(index, 1)
    newStaged.splice(targetIndex, 0, moved)
    onStagedImagesChange?.(newStaged)
  }

  // --- Set Primary Helpers ---
  const handleSetPrimaryLive = async (imageId: string) => {
    if (!productId) return
    await setPrimaryMutation.mutateAsync({ productId, imageId })

    const targetImg = optimisticLiveImages.find((img) => img.id === imageId)
    const targetUrl = targetImg
      ? resolveStorageUrl(targetImg.url) || resolveStorageUrl(targetImg.file_path)
      : null
    if (!targetUrl) return

    try {
      const response = await fetch(targetUrl)
      if (!response.ok) return
      const blob = await response.blob()
      const sourceFile = new File([blob], 'primary-image.webp', {
        type: blob.type || 'image/webp',
      })
      const compressedThumb = await compressThumbnail(sourceFile)
      await uploadThumbnailMutation.mutateAsync({ productId, file: compressedThumb })
    } catch {
      // Non-fatal: primary image was still switched even if auto-thumbnail fetch failed
    }
  }

  const handleSetPrimaryStaged = async (id: string) => {
    const updated = stagedImages.map((img) => ({
      ...img,
      is_primary: img.id === id,
    }))
    onStagedImagesChange?.(updated)

    const target = updated.find((img) => img.id === id)
    if (target) {
      const compressedThumb = await compressThumbnail(target.file)
      onStagedThumbnailChange?.({
        file: compressedThumb,
        previewUrl: URL.createObjectURL(compressedThumb),
      })
    }
  }

  // --- Delete Helpers ---
  const handleDeleteLive = (imageId: string) => {
    if (!productId) return
    deleteMutation.mutate({ productId, imageId })
  }

  const handleDeleteStaged = (id: string) => {
    const target = stagedImages.find((img) => img.id === id)
    if (target) {
      URL.revokeObjectURL(target.previewUrl)
    }
    const remaining = stagedImages.filter((img) => img.id !== id)
    if (target?.is_primary && remaining.length > 0) {
      remaining[0].is_primary = true
    }
    onStagedImagesChange?.(remaining)
  }

  const handleThumbnailSelected = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t('admin:errors.INVALID_IMAGE_FORMAT', 'Unsupported image format. Please upload JPEG, PNG, or WebP.'))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('admin:errors.FILE_TOO_LARGE', 'Image file exceeds the 5MB size limit.'))
      return
    }

    const compressedThumb = await compressThumbnail(file)

    if (isLive && productId) {
      await uploadThumbnailMutation.mutateAsync({ productId, file: compressedThumb })
    } else {
      onStagedThumbnailChange?.({
        file: compressedThumb,
        previewUrl: URL.createObjectURL(compressedThumb),
      })
    }
  }

  const handleDeleteThumbnail = async () => {
    if (isLive && productId) {
      await deleteThumbnailMutation.mutateAsync({ productId })
    } else {
      if (stagedThumbnail?.previewUrl) {
        URL.revokeObjectURL(stagedThumbnail.previewUrl)
      }
      onStagedThumbnailChange?.(null)
    }
  }

  const resolvedThumbnailUrl = isLive
    ? resolveStorageUrl(thumbnailUrl)
    : stagedThumbnail?.previewUrl ?? null

  return (
    <div className="space-y-5 text-start">
      {/* Catalog Card Thumbnail */}
      <div className="rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {t('admin:productEditor.thumbnailTitle', 'Catalog Card Thumbnail')}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(
                'admin:productEditor.thumbnailDesc',
                'Optimized 480×360 (4:3) WebP thumbnail for catalog grids. Falls back to primary gallery image if unset.',
              )}
            </p>
          </div>

          <input
            ref={thumbnailInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              handleThumbnailSelected(e.target.files)
              e.target.value = ''
            }}
          />

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadThumbnailMutation.isPending || deleteThumbnailMutation.isPending}
              onClick={() => thumbnailInputRef.current?.click()}
              className="gap-1.5 text-xs cursor-pointer"
            >
              {uploadThumbnailMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <UploadCloud className="size-3.5" />
              )}
              <span>
                {resolvedThumbnailUrl
                  ? t('admin:productEditor.replaceThumbnail', 'Replace Thumbnail')
                  : t('admin:productEditor.uploadThumbnail', 'Upload Thumbnail')}
              </span>
            </Button>

            {resolvedThumbnailUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={uploadThumbnailMutation.isPending || deleteThumbnailMutation.isPending}
                onClick={handleDeleteThumbnail}
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>{t('admin:productEditor.removeThumbnail', 'Remove')}</span>
              </Button>
            )}
          </div>
        </div>

        {resolvedThumbnailUrl && (
          <div className="flex items-center gap-3 pt-1">
            <img
              src={resolvedThumbnailUrl}
              alt={t('admin:productEditor.thumbnailTitle', 'Catalog Card Thumbnail')}
              className="size-16 rounded-lg object-cover border border-border/60 bg-background shrink-0"
            />
            <span className="text-xs text-muted-foreground">
              {t('admin:productEditor.thumbnailActiveHint', 'Active thumbnail preview')}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {t('admin:productEditor.media', 'Product Media')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'admin:productEditor.mediaDescription',
              'Upload up to 10 product images (auto-optimized to 1920×1440 4:3 WebP, max 5MB).',
            )}
          </p>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {totalImagesCount} / {MAX_IMAGES}
        </span>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFilesSelected(e.target.files)
            e.target.value = ''
          }
        }}
      />

      {/* Dropzone (shown if less than MAX_IMAGES) */}
      {totalImagesCount < MAX_IMAGES && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border/60 hover:border-border hover:bg-secondary/20',
            (uploadMutation.isPending || isProcessing) && 'opacity-60 pointer-events-none',
          )}
        >
          {uploadMutation.isPending || isProcessing ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <span className="text-sm font-medium">
                {uploadMutation.isPending
                  ? t('admin:productEditor.uploading', 'Uploading media...')
                  : t('admin:productEditor.compressing', 'Compressing media...')}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center select-none">
              <div className="size-12 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground">
                <UploadCloud className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {t('admin:productEditor.dropzoneTitle', 'Drag and drop product images here, or click to browse')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('admin:productEditor.dropzoneSubtitle', 'JPEG, PNG, or WebP up to 5MB')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Media Cards Grid */}
      {totalImagesCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
          {isLive
            ? optimisticLiveImages.map((img, index) => {
                const imageUrl = resolveStorageUrl(img.url) || resolveStorageUrl(img.file_path)
                const isFirst = index === 0
                const isLast = index === optimisticLiveImages.length - 1

                return (
                  <div
                    key={img.id}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-secondary/30 flex flex-col justify-between"
                  >
                    {/* Image Preview */}
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt=""
                        className="size-full object-cover select-none"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-muted-foreground/40">
                        <ImageIcon className="size-8" />
                      </div>
                    )}

                    {/* Top Overlay: Badges */}
                    <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                      {img.is_primary ? (
                        <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold gap-1 px-1.5 py-0.5 pointer-events-auto">
                          <Star className="size-3 fill-current" />
                          <span>{t('admin:productEditor.primaryBadge', 'Primary')}</span>
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon-xs"
                          onClick={() => handleSetPrimaryLive(img.id)}
                          title={t('admin:productEditor.setPrimary', 'Set as primary')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto size-6 rounded-md bg-background/80 hover:bg-background"
                        >
                          <Star className="size-3 text-muted-foreground" />
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-xs"
                        onClick={() => handleDeleteLive(img.id)}
                        disabled={deleteMutation.isPending}
                        title={t('admin:productEditor.deleteImage', 'Remove image')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto size-6 rounded-md"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>

                    {/* Bottom Overlay: Move Earlier / Later */}
                    <div className="absolute bottom-2 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-lg p-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleMoveLive(index, 'earlier')}
                        disabled={isFirst}
                        title={t('admin:productEditor.moveEarlier', 'Move earlier')}
                        className="size-6 cursor-pointer"
                      >
                        {isRtl ? <ArrowRight className="size-3.5" /> : <ArrowLeft className="size-3.5" />}
                      </Button>

                      <span className="text-[10px] font-mono font-medium text-muted-foreground">
                        {index + 1}
                      </span>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleMoveLive(index, 'later')}
                        disabled={isLast}
                        title={t('admin:productEditor.moveLater', 'Move later')}
                        className="size-6 cursor-pointer"
                      >
                        {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                      </Button>
                    </div>
                  </div>
                )
              })
            : stagedImages.map((img, index) => {
                const isFirst = index === 0
                const isLast = index === stagedImages.length - 1

                return (
                  <div
                    key={img.id}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-secondary/30 flex flex-col justify-between"
                  >
                    {/* Image Preview */}
                    <img
                      src={img.previewUrl}
                      alt=""
                      className="size-full object-cover select-none"
                    />

                    {/* Top Overlay: Badges */}
                    <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                      {img.is_primary ? (
                        <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold gap-1 px-1.5 py-0.5 pointer-events-auto">
                          <Star className="size-3 fill-current" />
                          <span>{t('admin:productEditor.primaryBadge', 'Primary')}</span>
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon-xs"
                          onClick={() => handleSetPrimaryStaged(img.id)}
                          title={t('admin:productEditor.setPrimary', 'Set as primary')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto size-6 rounded-md bg-background/80 hover:bg-background"
                        >
                          <Star className="size-3 text-muted-foreground" />
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-xs"
                        onClick={() => handleDeleteStaged(img.id)}
                        title={t('admin:productEditor.deleteImage', 'Remove image')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto size-6 rounded-md"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>

                    {/* Bottom Overlay: Move Earlier / Later */}
                    <div className="absolute bottom-2 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-lg p-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleMoveStaged(index, 'earlier')}
                        disabled={isFirst}
                        title={t('admin:productEditor.moveEarlier', 'Move earlier')}
                        className="size-6 cursor-pointer"
                      >
                        {isRtl ? <ArrowRight className="size-3.5" /> : <ArrowLeft className="size-3.5" />}
                      </Button>

                      <span className="text-[10px] font-mono font-medium text-muted-foreground">
                        {index + 1}
                      </span>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleMoveStaged(index, 'later')}
                        disabled={isLast}
                        title={t('admin:productEditor.moveLater', 'Move later')}
                        className="size-6 cursor-pointer"
                      >
                        {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                      </Button>
                    </div>
                  </div>
                )
              })}
        </div>
      )}
    </div>
  )
}

