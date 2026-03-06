'use client'

import { PLAN_LIMITS } from '@/lib/utils/constants'
import type { Plan } from '@/types/database'
import { cn } from '@/lib/utils/helpers'

interface UsageMeterProps {
  plan: Plan
  assetsUsed: number
  className?: string
}

export function UsageMeter({ plan, assetsUsed, className }: UsageMeterProps) {
  const limit = PLAN_LIMITS[plan]
  const percent = Math.min((assetsUsed / limit.assetsPerMonth) * 100, 100)
  const isNearLimit = percent >= 80
  const isAtLimit = percent >= 100

  return (
    <div className={cn('bg-surface border border-border rounded-lg p-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-secondary text-sm">Monthly Usage</span>
        <span
          className={cn(
            'text-sm font-medium',
            isAtLimit ? 'text-danger' : isNearLimit ? 'text-warning' : 'text-text-primary'
          )}
        >
          {assetsUsed} / {limit.assetsPerMonth} assets
        </span>
      </div>
      <div className="w-full h-2 bg-border rounded-full">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isAtLimit ? 'bg-danger' : isNearLimit ? 'bg-warning' : 'bg-accent'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="text-danger text-xs mt-2">
          You&apos;ve reached your monthly limit. Upgrade your plan for more assets.
        </p>
      )}
    </div>
  )
}
