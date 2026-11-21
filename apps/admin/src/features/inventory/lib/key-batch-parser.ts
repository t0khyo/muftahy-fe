export interface ParsedKeyBatch {
  rawKeys: string[]
  uniqueKeys: string[]
  duplicatesCount: number
  isTruncated: boolean
  effectiveKeys: string[]
}

export function parseKeyBatchInput(rawText: string): ParsedKeyBatch {
  const rawKeys = rawText
    .split(/[\r\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const seen = new Set<string>()
  const uniqueKeys: string[] = []
  let duplicatesCount = 0

  for (const key of rawKeys) {
    if (seen.has(key)) {
      duplicatesCount++
    } else {
      seen.add(key)
      uniqueKeys.push(key)
    }
  }

  const isTruncated = uniqueKeys.length > 500
  const effectiveKeys = uniqueKeys.slice(0, 500)

  return {
    rawKeys,
    uniqueKeys,
    duplicatesCount,
    isTruncated,
    effectiveKeys,
  }
}
