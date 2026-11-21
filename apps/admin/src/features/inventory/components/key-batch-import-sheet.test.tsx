import { describe, expect, it } from 'vitest'
import { parseKeyBatchInput } from '../lib/key-batch-parser'

describe('parseKeyBatchInput', () => {
  it('parses newline-separated keys and trims whitespace', () => {
    const raw = `
      KEY-1111-AAAA  
      KEY-2222-BBBB
      KEY-3333-CCCC
    `
    const result = parseKeyBatchInput(raw)
    expect(result.rawKeys).toEqual(['KEY-1111-AAAA', 'KEY-2222-BBBB', 'KEY-3333-CCCC'])
    expect(result.uniqueKeys).toEqual(['KEY-1111-AAAA', 'KEY-2222-BBBB', 'KEY-3333-CCCC'])
    expect(result.duplicatesCount).toBe(0)
    expect(result.isTruncated).toBe(false)
    expect(result.effectiveKeys.length).toBe(3)
  })

  it('parses comma-separated and semicolon-separated keys', () => {
    const raw = 'KEY-A, KEY-B; KEY-C\nKEY-D'
    const result = parseKeyBatchInput(raw)
    expect(result.rawKeys).toEqual(['KEY-A', 'KEY-B', 'KEY-C', 'KEY-D'])
    expect(result.uniqueKeys).toEqual(['KEY-A', 'KEY-B', 'KEY-C', 'KEY-D'])
    expect(result.duplicatesCount).toBe(0)
  })

  it('detects duplicates within batch and computes uniqueKeys correctly', () => {
    const raw = `
      KEY-DUP-1
      KEY-DUP-2
      KEY-DUP-1
      KEY-DUP-3
      KEY-DUP-2
      KEY-DUP-1
    `
    const result = parseKeyBatchInput(raw)
    expect(result.rawKeys.length).toBe(6)
    expect(result.uniqueKeys).toEqual(['KEY-DUP-1', 'KEY-DUP-2', 'KEY-DUP-3'])
    expect(result.duplicatesCount).toBe(3)
  })

  it('enforces 500-key ceiling and flags isTruncated', () => {
    const keysArray: string[] = []
    for (let i = 0; i < 600; i++) {
      keysArray.push(`KEY-TEST-${i}`)
    }
    const raw = keysArray.join('\n')
    const result = parseKeyBatchInput(raw)

    expect(result.rawKeys.length).toBe(600)
    expect(result.uniqueKeys.length).toBe(600)
    expect(result.isTruncated).toBe(true)
    expect(result.effectiveKeys.length).toBe(500)
    expect(result.effectiveKeys[0]).toBe('KEY-TEST-0')
    expect(result.effectiveKeys[499]).toBe('KEY-TEST-499')
  })
})
