import { describe, it, expect } from 'vitest'
import { cn, formatFileSize, formatDuration, truncateText, getSourceTypeFromFile } from '@/lib/utils/helpers'

describe('cn (class name merge)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('merges tailwind conflicts correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(5_242_880)).toBe('5.0 MB')
  })

  it('formats gigabytes', () => {
    expect(formatFileSize(1_073_741_824)).toBe('1.0 GB')
  })
})

describe('formatDuration', () => {
  it('formats zero seconds', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2:05')
  })

  it('formats exact minutes', () => {
    expect(formatDuration(60)).toBe('1:00')
  })
})

describe('truncateText', () => {
  it('returns short text unchanged', () => {
    expect(truncateText('hello', 10)).toBe('hello')
  })

  it('truncates long text with ellipsis', () => {
    expect(truncateText('this is a long string', 10)).toBe('this is...')
  })
})

describe('getSourceTypeFromFile', () => {
  it('detects video files', () => {
    const file = new File([], 'test.mp4', { type: 'video/mp4' })
    expect(getSourceTypeFromFile(file)).toBe('video')
  })

  it('detects audio files', () => {
    const file = new File([], 'test.mp3', { type: 'audio/mpeg' })
    expect(getSourceTypeFromFile(file)).toBe('audio')
  })
})
