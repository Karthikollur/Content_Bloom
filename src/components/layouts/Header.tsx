'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { PLAN_LIMITS } from '@/lib/utils/constants'

export function Header() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()

        if (data) {
          setProfile(data as unknown as Profile)
        }
      }
    }

    loadProfile()
  }, [])

  const planLimit = profile ? PLAN_LIMITS[profile.plan] : PLAN_LIMITS.free
  const assetsUsed = profile?.assets_used_this_month ?? 0
  const usagePercent = Math.min((assetsUsed / planLimit.assetsPerMonth) * 100, 100)

  return (
    <header className="border-b border-border bg-surface/50 backdrop-blur-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-4">
          {/* Usage meter */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-text-secondary text-xs">
                {assetsUsed}/{planLimit.assetsPerMonth} assets
              </p>
              <div className="w-24 h-1.5 bg-border rounded-full mt-1">
                <div
                  className={`h-full rounded-full transition-all ${
                    usagePercent >= 90 ? 'bg-danger' : usagePercent >= 70 ? 'bg-warning' : 'bg-accent'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
            <div className="bg-accent-soft text-accent text-xs font-medium px-2 py-0.5 rounded-full capitalize">
              {profile?.plan ?? 'free'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
