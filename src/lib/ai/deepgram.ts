interface DeepgramWord {
  word: string
  punctuated_word?: string
  start: number
  end: number
  speaker?: number
  confidence?: number
}

interface DeepgramAlternative {
  transcript: string
  confidence: number
  words?: DeepgramWord[]
}

interface DeepgramChannel {
  alternatives: DeepgramAlternative[]
}

interface DeepgramMetadata {
  duration?: number
}

export interface DeepgramResponse {
  metadata?: DeepgramMetadata
  results?: {
    channels?: DeepgramChannel[]
  }
}

interface TranscriptionResult {
  transcript: string
  durationSeconds: number
  costUsd: number
}

const DEEPGRAM_NOVA2_USD_PER_MINUTE = 0.0043

export function stitchSpeakerTranscript(
  words: ReadonlyArray<DeepgramWord>,
  fallbackTranscript: string
): string {
  if (words.length === 0) {
    return fallbackTranscript
  }

  const distinctSpeakers = new Set(
    words.map((w) => w.speaker).filter((s): s is number => typeof s === 'number')
  )

  if (distinctSpeakers.size <= 1) {
    return fallbackTranscript
  }

  const segments: string[] = []
  let currentSpeaker: number | undefined
  let currentTokens: string[] = []

  const flush = () => {
    if (currentTokens.length === 0) return
    const label = `Speaker ${currentSpeaker ?? 0}:`
    segments.push(`${label} ${currentTokens.join(' ').trim()}`)
    currentTokens = []
  }

  for (const w of words) {
    const token = w.punctuated_word ?? w.word
    if (w.speaker !== currentSpeaker) {
      flush()
      currentSpeaker = w.speaker
    }
    currentTokens.push(token)
  }
  flush()

  return segments.join('\n\n')
}

export function calculateTranscriptionCost(durationSeconds: number): number {
  if (durationSeconds <= 0) return 0
  return (durationSeconds / 60) * DEEPGRAM_NOVA2_USD_PER_MINUTE
}

export async function transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
  const apiKey = process.env.DEEPGRAM_API_KEY
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY not configured')
  }

  const response = await fetch(
    'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&diarize=true&punctuate=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: audioUrl }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Deepgram transcription failed (${response.status}): ${errorText}`)
  }

  const data = (await response.json()) as DeepgramResponse
  const alternative = data.results?.channels?.[0]?.alternatives?.[0]
  const baseTranscript = alternative?.transcript ?? ''
  const words = alternative?.words ?? []
  const transcript = stitchSpeakerTranscript(words, baseTranscript)
  const durationSeconds = Math.round(data.metadata?.duration ?? 0)
  const costUsd = calculateTranscriptionCost(durationSeconds)

  return {
    transcript,
    durationSeconds,
    costUsd,
  }
}
