import { describe, expect, it } from 'vitest'
import { isInsufficientSource } from '@/lib/ai/source-check'

describe('isInsufficientSource', () => {
  it('returns true for the literal escape-hatch prefix', () => {
    expect(isInsufficientSource('INSUFFICIENT_SOURCE: transcript too thin')).toBe(true)
  })

  it('tolerates leading whitespace from the model', () => {
    expect(isInsufficientSource('  \n  INSUFFICIENT_SOURCE: nope')).toBe(true)
  })

  it('returns false for normal content that mentions the token mid-string', () => {
    expect(isInsufficientSource('Here is a post about INSUFFICIENT_SOURCE patterns.')).toBe(false)
  })

  it('returns false for empty / whitespace-only content', () => {
    expect(isInsufficientSource('')).toBe(false)
    expect(isInsufficientSource('   \n  ')).toBe(false)
  })

  it('is case-sensitive (matches the exact prompt contract)', () => {
    expect(isInsufficientSource('insufficient_source: lower')).toBe(false)
    expect(isInsufficientSource('Insufficient_Source: mixed')).toBe(false)
  })

  it('matches even without the colon (defensive)', () => {
    expect(isInsufficientSource('INSUFFICIENT_SOURCE no colon')).toBe(true)
  })
})
