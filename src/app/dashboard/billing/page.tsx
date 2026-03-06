'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Check } from 'lucide-react'
import { UsageMeter } from '@/components/features/UsageMeter'
import { PLANS } from '@/lib/stripe/plans'
import type { Profile } from '@/types/database'

export default function BillingPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()

        if (data) setProfile(data as unknown as Profile)
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-accent animate-spin" size={24} />
      </div>
    )
  }

  const currentPlan = profile?.plan ?? 'free'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-text-primary text-2xl font-semibold">Billing</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your plan and usage</p>
      </div>

      {/* Current usage */}
      {profile && (
        <UsageMeter
          plan={profile.plan}
          assetsUsed={profile.assets_used_this_month}
          className="mb-8 max-w-md"
        />
      )}

      {/* Plans grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(PLANS).map(([key, plan]) => {
          const isCurrentPlan = key === currentPlan

          return (
            <div
              key={key}
              className={`bg-surface border rounded-lg p-6 ${
                isCurrentPlan ? 'border-accent' : 'border-border'
              }`}
            >
              {isCurrentPlan && (
                <div className="bg-accent-soft text-accent text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-3">
                  Current Plan
                </div>
              )}
              <h3 className="text-text-primary font-semibold text-lg">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-text-primary text-3xl font-bold">${plan.price}</span>
                <span className="text-text-tertiary text-sm">/mo</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="text-accent mt-0.5 shrink-0" size={14} />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full bg-surface border border-border text-text-tertiary font-medium px-4 py-2 rounded-lg"
                >
                  Current
                </button>
              ) : (
                <button className="w-full bg-accent hover:bg-accent-hover text-background font-medium px-4 py-2 rounded-lg transition-colors">
                  {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-text-tertiary text-xs mt-6">
        Stripe payment integration will be fully connected in Phase 3.
      </p>
    </div>
  )
}
