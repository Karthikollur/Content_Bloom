import { describe, expect, it } from 'vitest'
import { calculateTranscriptionCost, stitchSpeakerTranscript } from '@/lib/ai/deepgram'

describe('calculateTranscriptionCost', () => {
  it('returns 0 for non-positive durations', () => {
    expect(calculateTranscriptionCost(0)).toBe(0)
    expect(calculateTranscriptionCost(-30)).toBe(0)
  })

  it('charges $0.0043 per minute (Nova-2)', () => {
    expect(calculateTranscriptionCost(60)).toBeCloseTo(0.0043, 6)
    expect(calculateTranscriptionCost(120)).toBeCloseTo(0.0086, 6)
  })

  it('prorates partial minutes', () => {
    expect(calculateTranscriptionCost(30)).toBeCloseTo(0.00215, 6)
  })
})

describe('stitchSpeakerTranscript', () => {
  it('returns fallback when no words are provided', () => {
    expect(stitchSpeakerTranscript([], 'plain text')).toBe('plain text')
  })

  it('returns fallback when only one speaker is present', () => {
    const words = [
      { word: 'hello', start: 0, end: 1, speaker: 0 },
      { word: 'world', start: 1, end: 2, speaker: 0 },
    ]
    expect(stitchSpeakerTranscript(words, 'hello world')).toBe('hello world')
  })

  it('returns fallback when no speaker labels exist', () => {
    const words = [
      { word: 'hello', start: 0, end: 1 },
      { word: 'world', start: 1, end: 2 },
    ]
    expect(stitchSpeakerTranscript(words, 'hello world')).toBe('hello world')
  })

  it('stitches alternating speakers with paragraph breaks', () => {
    const words = [
      { word: 'hi', start: 0, end: 1, speaker: 0 },
      { word: 'there', start: 1, end: 2, speaker: 0 },
      { word: 'hello', start: 2, end: 3, speaker: 1 },
      { word: 'back', start: 3, end: 4, speaker: 0 },
    ]
    const stitched = stitchSpeakerTranscript(words, 'hi there hello back')
    expect(stitched).toBe('Speaker 0: hi there\n\nSpeaker 1: hello\n\nSpeaker 0: back')
  })

  it('prefers punctuated_word when available', () => {
    const words = [
      { word: 'hello', punctuated_word: 'Hello,', start: 0, end: 1, speaker: 0 },
      { word: 'world', punctuated_word: 'world.', start: 1, end: 2, speaker: 1 },
    ]
    const stitched = stitchSpeakerTranscript(words, 'hello world')
    expect(stitched).toBe('Speaker 0: Hello,\n\nSpeaker 1: world.')
  })
})
