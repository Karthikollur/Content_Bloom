'use client'

import Link from 'next/link'
import { Mic, Video, FileText, Link as LinkIcon } from 'lucide-react'
import { ProcessingStatus } from './ProcessingStatus'
import { formatRelativeTime, formatFileSize } from '@/lib/utils/helpers'
import type { Asset } from '@/types/database'

interface AssetCardProps {
  asset: Asset
}

const SOURCE_ICONS = {
  audio: Mic,
  video: Video,
  text: FileText,
  url: LinkIcon,
}

export function AssetCard({ asset }: AssetCardProps) {
  const Icon = SOURCE_ICONS[asset.source_type]

  return (
    <Link
      href={`/dashboard/asset/${asset.id}`}
      className="bg-surface border border-border rounded-lg p-4 hover:border-text-tertiary transition-colors block"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center">
            <Icon className="text-accent" size={18} />
          </div>
          <div>
            <h3 className="text-text-primary font-medium text-sm">{asset.title}</h3>
            <p className="text-text-tertiary text-xs mt-0.5">
              {asset.source_type} &middot; {formatRelativeTime(asset.created_at)}
              {asset.file_size_bytes ? ` \u00B7 ${formatFileSize(asset.file_size_bytes)}` : ''}
            </p>
          </div>
        </div>
        <ProcessingStatus status={asset.status} />
      </div>

      {asset.error_message && (
        <p className="text-danger text-xs bg-danger/10 px-2 py-1 rounded mt-2">
          {asset.error_message}
        </p>
      )}
    </Link>
  )
}
