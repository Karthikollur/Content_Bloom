'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, FileText, Mic, Video, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ProcessingStatus } from '@/components/features/ProcessingStatus'
import { formatRelativeTime, formatFileSize } from '@/lib/utils/helpers'
import type { Asset, Output } from '@/types/database'

const SOURCE_ICONS = {
  audio: Mic,
  video: Video,
  text: FileText,
  url: LinkIcon,
}

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [outputs, setOutputs] = useState<Output[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAsset = async () => {
      const supabase = createClient()
      const assetId = params.id as string

      const { data: assetData, error: assetError } = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .single()

      if (assetError || !assetData) {
        setError(assetError?.message ?? 'Asset not found')
        setLoading(false)
        return
      }

      const typedAsset = assetData as unknown as Asset
      setAsset(typedAsset)

      // Load outputs if asset is complete
      if (typedAsset.status === 'complete') {
        const { data: outputData } = await supabase
          .from('outputs')
          .select('*')
          .eq('asset_id', assetId)
          .order('platform')

        setOutputs((outputData ?? []) as unknown as Output[])
      }

      setLoading(false)
    }

    loadAsset()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-accent animate-spin" size={24} />
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="text-center py-20">
        <p className="text-danger mb-4">{error ?? 'Asset not found'}</p>
        <Link href="/dashboard" className="text-accent hover:text-accent-hover transition-colors">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const Icon = SOURCE_ICONS[asset.source_type]

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm mb-6"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Asset header */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent-soft flex items-center justify-center">
              <Icon className="text-accent" size={24} />
            </div>
            <div>
              <h1 className="text-text-primary text-xl font-semibold">{asset.title}</h1>
              <p className="text-text-tertiary text-sm mt-1">
                {asset.source_type} &middot; {formatRelativeTime(asset.created_at)}
                {asset.file_size_bytes ? ` \u00B7 ${formatFileSize(asset.file_size_bytes)}` : ''}
              </p>
            </div>
          </div>
          <ProcessingStatus status={asset.status} />
        </div>

        {asset.error_message && (
          <div className="bg-danger/10 text-danger text-sm px-3 py-2 rounded-lg mt-4">
            {asset.error_message}
          </div>
        )}
      </div>

      {/* Transcript section */}
      {asset.transcript && (
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <h2 className="text-text-primary font-medium mb-3">Transcript</h2>
          <div className="text-text-secondary text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
            {asset.transcript}
          </div>
        </div>
      )}

      {/* Outputs section */}
      {outputs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-text-primary font-medium">Generated Outputs</h2>
          {outputs.map((output) => (
            <div key={output.id} className="bg-surface border border-border rounded-lg p-6">
              <h3 className="text-text-primary font-medium capitalize mb-3">{output.platform}</h3>
              <div className="text-text-secondary text-sm whitespace-pre-wrap">
                {output.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state for outputs */}
      {asset.status === 'uploaded' && (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-text-secondary text-sm mb-1">
            This asset is ready to be processed.
          </p>
          <p className="text-text-tertiary text-xs">
            AI content generation will be available in Phase 2.
          </p>
        </div>
      )}

      {['transcribing', 'generating'].includes(asset.status) && (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <Loader2 className="text-accent animate-spin mx-auto mb-3" size={24} />
          <p className="text-text-secondary text-sm">Processing your content...</p>
        </div>
      )}
    </div>
  )
}
