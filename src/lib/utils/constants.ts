export const MAX_FILE_SIZE = 500_000_000 // 500MB

export const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4']
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime']
export const ACCEPTED_FILE_TYPES = [...ACCEPTED_AUDIO_TYPES, ...ACCEPTED_VIDEO_TYPES]

export const ACCEPTED_EXTENSIONS = '.mp3,.wav,.m4a,.mp4,.mov'

export const PLAN_LIMITS: Record<string, { assetsPerMonth: number; maxDurationMinutes: number }> = {
  free: { assetsPerMonth: 1, maxDurationMinutes: 15 },
  creator: { assetsPerMonth: 5, maxDurationMinutes: 120 },
  pro: { assetsPerMonth: 20, maxDurationMinutes: 240 },
  agency: { assetsPerMonth: 999, maxDurationMinutes: 480 },
}

export const STATUS_LABELS: Record<string, string> = {
  uploading: 'Uploading...',
  uploaded: 'Ready to process',
  transcribing: 'Transcribing audio...',
  generating: 'Generating content...',
  complete: 'Complete',
  failed: 'Failed',
}

export const STATUS_COLORS: Record<string, string> = {
  uploading: 'text-warning',
  uploaded: 'text-text-secondary',
  transcribing: 'text-warning',
  generating: 'text-accent',
  complete: 'text-accent',
  failed: 'text-danger',
}
