'use client'

import { useMemo, useState } from 'react'
import type { Output, Platform } from '@/types/database'
import { OutputCard } from './OutputCard'

interface OutputTabsProps {
  outputs: ReadonlyArray<Output>
  onRegenerate: (platform: Platform) => Promise<void>
  onUpdated: () => Promise<void> | void
}

const PLATFORM_ORDER: ReadonlyArray<Extract<Platform, 'linkedin' | 'twitter' | 'newsletter'>> = [
  'linkedin',
  'twitter',
  'newsletter',
]

const PLATFORM_LABEL: Record<Platform, string> = {
  linkedin: 'LinkedIn',
  twitter: 'X / Twitter',
  newsletter: 'Newsletter',
  instagram: 'Instagram',
  youtube_shorts: 'YouTube Shorts',
}

function pickLatestPerPlatform(outputs: ReadonlyArray<Output>): Map<Platform, Output> {
  const latest = new Map<Platform, Output>()
  for (const output of outputs) {
    const existing = latest.get(output.platform)
    if (!existing || output.version > existing.version) {
      latest.set(output.platform, output)
    }
  }
  return latest
}

export function OutputTabs({ outputs, onRegenerate, onUpdated }: OutputTabsProps) {
  const latestByPlatform = useMemo(() => pickLatestPerPlatform(outputs), [outputs])
  const availablePlatforms = useMemo(
    () => PLATFORM_ORDER.filter((p) => latestByPlatform.has(p)),
    [latestByPlatform]
  )
  const [activePlatform, setActivePlatform] = useState<Platform | null>(
    availablePlatforms[0] ?? null
  )

  if (availablePlatforms.length === 0) return null

  const current = activePlatform ? latestByPlatform.get(activePlatform) : undefined
  const fallback = current ?? latestByPlatform.get(availablePlatforms[0])

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
        {availablePlatforms.map((platform) => {
          const isActive =
            (activePlatform ?? availablePlatforms[0]) === platform
          return (
            <button
              key={platform}
              type="button"
              onClick={() => setActivePlatform(platform)}
              className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent-soft text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              aria-selected={isActive}
              role="tab"
            >
              {PLATFORM_LABEL[platform]}
            </button>
          )
        })}
      </div>

      {fallback && (
        <OutputCard
          key={fallback.id}
          output={fallback}
          onRegenerate={onRegenerate}
          onUpdated={onUpdated}
        />
      )}
    </div>
  )
}
