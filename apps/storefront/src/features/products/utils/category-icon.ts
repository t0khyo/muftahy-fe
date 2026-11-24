import type { ComponentType } from 'react'
import { FileText, FolderTree, Grid2x2, ShieldCheck } from 'lucide-react'

/**
 * Resolves the appropriate Lucide icon component for a product category
 * based on its canonical code or slug.
 */
export function resolveCategoryIcon(
  code?: string,
  slug?: string,
): ComponentType<{ className?: string }> {
  const normalizedCode = code?.toUpperCase()
  const normalizedSlug = slug?.toLowerCase()

  if (
    normalizedCode === 'OS' ||
    normalizedSlug === 'operating-systems' ||
    normalizedSlug?.includes('windows') ||
    normalizedSlug?.includes('operating')
  ) {
    return Grid2x2
  }
  if (
    normalizedCode === 'SEC' ||
    normalizedSlug === 'security-antivirus' ||
    normalizedSlug?.includes('security') ||
    normalizedSlug?.includes('antivirus')
  ) {
    return ShieldCheck
  }
  if (
    normalizedCode === 'OFF' ||
    normalizedSlug === 'office-suites' ||
    normalizedSlug?.includes('office')
  ) {
    return FileText
  }
  return FolderTree
}

