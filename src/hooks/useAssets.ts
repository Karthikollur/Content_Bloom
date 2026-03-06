'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Asset } from '@/types/database'

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAssets = useCallback(async () => {
    setLoading(true)
    setError(null)

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
  }, [])

  useEffect(() => {
    loadAssets()
  }, [loadAssets])

  const refresh = useCallback(() => {
    loadAssets()
  }, [loadAssets])

  return { assets, loading, error, refresh }
}
