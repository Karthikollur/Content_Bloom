'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AssetCard } from './AssetCard'
import type { Asset } from '@/types/database'

export function AssetList() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAssets = async () => {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setAssets((data ?? []) as unknown as Asset[])
      }
      setLoading(false)
    }

    loadAssets()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-accent animate-spin" size={24} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-lg">
        Failed to load assets: {error}
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4">
          <Upload className="text-text-tertiary" size={24} />
        </div>
        <h3 className="text-text-primary font-medium mb-2">No content yet</h3>
        <p className="text-text-secondary text-sm mb-6">
          Upload your first piece of content to get started.
        </p>
        <Link
          href="/dashboard/upload"
          className="bg-accent hover:bg-accent-hover text-background font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <Upload size={16} />
          Upload Content
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  )
}
