'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save } from 'lucide-react'
import type { BrandVoice } from '@/types/database'

export default function SettingsPage() {
  const [voiceDescription, setVoiceDescription] = useState('')
  const [exampleContent, setExampleContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingVoiceId, setExistingVoiceId] = useState<string | null>(null)

  useEffect(() => {
    const loadVoice = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('brand_voices')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        const voice = data as unknown as BrandVoice | null
        if (voice) {
          setVoiceDescription(voice.voice_description)
          setExampleContent(voice.example_content ?? '')
          setExistingVoiceId(voice.id)
        }
      }
      setLoading(false)
    }

    loadVoice()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Please sign in')

      if (existingVoiceId) {
        const { error: updateError } = await supabase
          .from('brand_voices')
          .update({
            voice_description: voiceDescription,
            example_content: exampleContent || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingVoiceId)

        if (updateError) throw new Error(updateError.message)
      } else {
        const { data, error: insertError } = await supabase
          .from('brand_voices')
          .insert({
            user_id: user.id,
            voice_description: voiceDescription,
            example_content: exampleContent || null,
          })
          .select()
          .single()

        if (insertError) throw new Error(insertError.message)
        const voice = data as Record<string, unknown> | null
        if (voice) setExistingVoiceId(voice.id as string)
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-accent animate-spin" size={24} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-text-primary text-2xl font-semibold">Brand Voice</h1>
        <p className="text-text-secondary text-sm mt-1">
          Define your writing style. All generated content will match this voice.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-text-secondary text-sm mb-1.5">Voice Description</label>
          <textarea
            value={voiceDescription}
            onChange={(e) => setVoiceDescription(e.target.value)}
            className="w-full h-32 bg-background border border-border text-text-primary placeholder:text-text-tertiary rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            placeholder="Describe your writing style. E.g., 'Professional but approachable. I use short sentences and real-world examples. No buzzwords. Direct and actionable.'"
          />
        </div>

        <div>
          <label className="block text-text-secondary text-sm mb-1.5">
            Example Content (Optional)
          </label>
          <textarea
            value={exampleContent}
            onChange={(e) => setExampleContent(e.target.value)}
            className="w-full h-48 bg-background border border-border text-text-primary placeholder:text-text-tertiary rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            placeholder="Paste 2-3 examples of your existing writing so the AI can learn your style..."
          />
          <p className="text-text-tertiary text-xs mt-1">
            Paste existing LinkedIn posts, tweets, or newsletter snippets.
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 text-danger text-sm px-3 py-2 rounded-lg">{error}</div>
        )}

        {success && (
          <div className="bg-accent-soft text-accent text-sm px-3 py-2 rounded-lg">
            Brand voice saved successfully!
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !voiceDescription.trim()}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-background font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Voice Settings
        </button>
      </div>
    </div>
  )
}
