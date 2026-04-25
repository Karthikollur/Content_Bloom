'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Loader2, FileText, Mic, Video, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ProcessingStatus } from '@/components/features/ProcessingStatus'
import { OutputTabs } from '@/components/features/OutputTabs'
import { formatRelativeTime, formatFileSize } from '@/lib/utils/helpers'
import type { Asset, AssetStatus, Output, Platform } from '@/types/database'

const SOURCE_ICONS = {
  audio: Mic,
  video: Video,
  text: FileText,
  url: LinkIcon,
}

const POLL_INTERVAL_MS = 3000
const ACTIVE_STATUSES: ReadonlySet<AssetStatus> = new Set<AssetStatus>([
  'uploading',
  'uploaded',
  'transcribing',
  'generating',
])

export default function AssetDetailPage() {
  const params = useParams()
  const assetId = params.id as string
  const [asset, setAsset] = useState<Asset | null>(null)
  const [outputs, setOutputs] = useState<Output[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchAsset = useCallback(async () => {
    const supabase = createClient()
    const { data, error: assetError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (assetError || !data) {
      setError(assetError?.message ?? 'Asset not found')
      return null
    }
    const typed = data as unknown as Asset
    setAsset(typed)
    setError(null)
    return typed
  }, [assetId])

  const fetchOutputs = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('outputs')
      .select('*')
      .eq('asset_id', assetId)
      .order('version', { ascending: false })
    setOutputs((data ?? []) as unknown as Output[])
  }, [assetId])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const initial = async () => {
      const current = await fetchAsset()
      if (cancelled) return
      if (current && !ACTIVE_STATUSES.has(current.status)) {
        await fetchOutputs()
      }
      setLoading(false)
    }

    initial()
    return () => {
      cancelled = true
      stopPolling()
    }
  }, [fetchAsset, fetchOutputs, stopPolling])

  useEffect(() => {
    if (!asset) return
    if (!ACTIVE_STATUSES.has(asset.status)) {
      stopPolling()
      return
    }
    if (pollRef.current) return

    pollRef.current = setInterval(async () => {
      const next = await fetchAsset()
      if (next && !ACTIVE_STATUSES.has(next.status)) {
        await fetchOutputs()
        stopPolling()
      }
    }, POLL_INTERVAL_MS)
  }, [asset, fetchAsset, fetchOutputs, stopPolling])

  const handleRegenerate = useCallback(
    async (platform: Platform) => {
      const response = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, platform }),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Regenerate failed')
      }
      await fetchOutputs()
    },
    [assetId, fetchOutputs]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-accent animate-spin" size={24} aria-hidden="true" />
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="text-center py-20">
        <p role="alert" className="text-danger mb-4">
          {error ?? 'Asset not found'}
        </p>
        <Link href="/dashboard" className="text-accent hover:text-accent-hover transition-colors">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const Icon = SOURCE_ICONS[asset.source_type]
  const isActive = ACTIVE_STATUSES.has(asset.status)
  const hasOutputs = outputs.length > 0

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm mb-6"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent-soft flex items-center justify-center">
              <Icon className="text-accent" size={24} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-text-primary text-xl font-semibold">{asset.title}</h1>
              <p className="text-text-tertiary text-sm mt-1">
                {asset.source_type} &middot; {formatRelativeTime(asset.created_at)}
                {asset.file_size_bytes ? ` · ${formatFileSize(asset.file_size_bytes)}` : ''}
              </p>
            </div>
          </div>
          <ProcessingStatus status={asset.status} />
        </div>

        {asset.error_message && (
          <div role="alert" className="bg-danger/10 text-danger text-sm px-3 py-2 rounded-lg mt-4">
            {asset.error_message}
          </div>
        )}
      </div>

      {asset.transcript && (
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <h2 className="text-text-primary font-medium mb-3">Transcript</h2>
          <div className="text-text-secondary text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
            {asset.transcript}
          </div>
        </div>
      )}

      {hasOutputs && (
        <OutputTabs outputs={outputs} onRegenerate={handleRegenerate} onUpdated={fetchOutputs} />
      )}

      {!hasOutputs && asset.status === 'uploaded' && asset.source_type !== 'audio' && asset.source_type !== 'video' && (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-text-secondary text-sm mb-1">This asset is ready to be processed.</p>
          <p className="text-text-tertiary text-xs">
            Generation for text and URL sources is coming in Phase 3.
          </p>
        </div>
      )}

      {!hasOutputs && isActive && (
        <div role="status" className="bg-surface border border-border rounded-lg p-8 text-center">
          <Loader2 className="text-accent animate-spin mx-auto mb-3" size={24} aria-hidden="true" />
          <p className="text-text-secondary text-sm">Processing your content...</p>
        </div>
      )}
    </div>
  )
}
