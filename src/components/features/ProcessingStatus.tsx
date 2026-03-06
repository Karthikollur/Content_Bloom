'use client'

import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils/constants'
import { Loader2, CheckCircle2, XCircle, Upload, Clock } from 'lucide-react'
import type { AssetStatus } from '@/types/database'
import { cn } from '@/lib/utils/helpers'

interface ProcessingStatusProps {
  status: AssetStatus
  className?: string
}

const STATUS_ICONS: Record<AssetStatus, React.ReactNode> = {
  uploading: <Loader2 size={14} className="animate-spin" />,
  uploaded: <Clock size={14} />,
  transcribing: <Loader2 size={14} className="animate-spin" />,
  generating: <Loader2 size={14} className="animate-spin" />,
  complete: <CheckCircle2 size={14} />,
  failed: <XCircle size={14} />,
}

export function ProcessingStatus({ status, className }: ProcessingStatusProps) {
  return (
    <div className={cn('flex items-center gap-1.5', STATUS_COLORS[status], className)}>
      {STATUS_ICONS[status]}
      <span className="text-xs font-medium">{STATUS_LABELS[status]}</span>
    </div>
  )
}
