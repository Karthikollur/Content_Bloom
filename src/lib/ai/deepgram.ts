interface TranscriptionResult {
  transcript: string
  durationSeconds: number
  costUsd: number
}

export async function transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
  const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&diarize=true', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: audioUrl }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Deepgram transcription failed: ${errorText}`)
  }

  const data = await response.json()

  const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ''
  const durationSeconds = Math.round(data.metadata?.duration ?? 0)

  // Deepgram Nova-2 pricing: $0.0043/minute
  const durationMinutes = durationSeconds / 60
  const costUsd = durationMinutes * 0.0043

  return {
    transcript,
    durationSeconds,
    costUsd,
  }
}
