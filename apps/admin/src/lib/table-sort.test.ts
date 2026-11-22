import { describe, expect, it } from 'vitest'
import { sortData } from './table-sort'

describe('table-sort utility', () => {
  interface TestItem {
    id: string
    name: string
    price: number
    isActive: boolean
    createdAt: string
  }

  const items: TestItem[] = [
    { id: '3', name: 'Zebra', price: 50, isActive: false, createdAt: '2026-03-01T00:00:00Z' },
    { id: '1', name: 'Apple', price: 100, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
    { id: '2', name: 'Banana', price: 20, isActive: true, createdAt: '2026-02-01T00:00:00Z' },
  ]

  it('returns items unchanged if no sortConfig provided', () => {
    expect(sortData(items, null)).toEqual(items)
  })

  it('sorts strings ascending and descending', () => {
    const asc = sortData(items, { column: 'name', direction: 'asc' })
    expect(asc.map((i) => i.name)).toEqual(['Apple', 'Banana', 'Zebra'])

    const desc = sortData(items, { column: 'name', direction: 'desc' })
    expect(desc.map((i) => i.name)).toEqual(['Zebra', 'Banana', 'Apple'])
  })

  it('sorts numbers ascending and descending', () => {
    const asc = sortData(items, { column: 'price', direction: 'asc' })
    expect(asc.map((i) => i.price)).toEqual([20, 50, 100])

    const desc = sortData(items, { column: 'price', direction: 'desc' })
    expect(desc.map((i) => i.price)).toEqual([100, 50, 20])
  })

  it('sorts date strings chronologically', () => {
    const asc = sortData(items, { column: 'createdAt', direction: 'asc' })
    expect(asc.map((i) => i.id)).toEqual(['1', '2', '3'])

    const desc = sortData(items, { column: 'createdAt', direction: 'desc' })
    expect(desc.map((i) => i.id)).toEqual(['3', '2', '1'])
  })

  it('sorts booleans correctly', () => {
    const asc = sortData(items, { column: 'isActive', direction: 'asc' })
    expect(asc[0].isActive).toBe(false)
    expect(asc[2].isActive).toBe(true)
  })

  it('supports custom accessors', () => {
    const custom = sortData(
      items,
      { column: 'custom', direction: 'asc' },
      { custom: (item) => item.price * 2 }
    )
    expect(custom.map((i) => i.price)).toEqual([20, 50, 100])
  })
})

