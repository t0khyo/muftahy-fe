export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  column: string
  direction: SortDirection
}

export function sortData<T>(
  items: T[],
  sortConfig: SortConfig | null,
  customAccessors?: Record<string, (item: T) => unknown>
): T[] {
  if (!sortConfig) return items

  const { column, direction } = sortConfig
  const accessor = customAccessors?.[column] || ((item: T) => (item as Record<string, unknown>)[column])

  return [...items].sort((a, b) => {
    const valA = accessor(a)
    const valB = accessor(b)

    if (valA === valB) return 0
    if (valA === null || valA === undefined) return 1
    if (valB === null || valB === undefined) return -1

    let comparison: number
    if (typeof valA === 'number' && typeof valB === 'number') {
      comparison = valA - valB
    } else if (valA instanceof Date && valB instanceof Date) {
      comparison = valA.getTime() - valB.getTime()
    } else if (typeof valA === 'boolean' && typeof valB === 'boolean') {
      comparison = (valA ? 1 : 0) - (valB ? 1 : 0)
    } else {
      // Check if values can be parsed as dates if they are ISO date strings
      const strA = String(valA)
      const strB = String(valB)
      const dateA = Date.parse(strA)
      const dateB = Date.parse(strB)

      // Only treat as date if it looks like a valid date format and not a plain number
      if (!isNaN(dateA) && !isNaN(dateB) && isNaN(Number(strA)) && (strA.includes('-') || strA.includes(':'))) {
        comparison = dateA - dateB
      } else {
        comparison = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' })
      }
    }

    return direction === 'asc' ? comparison : -comparison
  })
}
