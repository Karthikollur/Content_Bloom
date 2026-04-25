'use client'

import { useState } from 'react'
import { Check, Copy, Loader2, Pencil, RefreshCw, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Output, Platform } from '@/types/database'

interface OutputCardProps {
  output: Output
  onRegenerate: (platform: Platform) => Promise<void>
  onUpdated: () => Promise<void> | void
}

export function OutputCard({ output, onRegenerate, onUpdated }: OutputCardProps) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(output.content)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('Could not copy to clipboard')
    }
  }

  const handleEdit = () => {
    setDraft(output.content)
    setIsEditing(true)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setDraft(output.content)
    setError(null)
  }

  const handleSave = async () => {
    if (draft.trim() === output.content.trim()) {
      setIsEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('outputs')
        .update({ content: draft, is_edited: true })
        .eq('id', output.id)
      if (updateError) throw new Error(updateError.message)
      await onUpdated()
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    setError(null)
    try {
      await onRegenerate(output.platform)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regenerate failed')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-text-primary font-medium capitalize">{output.platform}</h3>
          {output.is_edited && (
            <span className="text-text-tertiary text-xs">edited</span>
          )}
          {output.version > 1 && (
            <span className="text-text-tertiary text-xs">v{output.version}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            disabled={isEditing}
            className="text-text-tertiary hover:text-text-primary transition-colors p-1.5 disabled:opacity-50"
            aria-label="Copy output"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="text-text-tertiary hover:text-text-primary transition-colors p-1.5"
              aria-label="Edit output"
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating || isEditing}
            className="text-text-tertiary hover:text-text-primary transition-colors p-1.5 disabled:opacity-50"
            aria-label="Regenerate output"
          >
            {regenerating ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw size={16} />
            )}
          </button>
        </div>
      </div>

      {isEditing ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={Math.min(20, Math.max(6, draft.split('\n').length + 1))}
            className="w-full bg-background border border-border text-text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            aria-label={`${output.platform} content`}
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="text-text-secondary hover:text-text-primary text-sm px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-50"
            >
              <X size={14} /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-accent hover:bg-accent-hover text-background text-sm font-medium px-3 py-1.5 rounded-md inline-flex items-center gap-1 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <Check size={14} />
              )}
              Save
            </button>
          </div>
        </>
      ) : (
        <div className="text-text-secondary text-sm whitespace-pre-wrap">{output.content}</div>
      )}

      {error && (
        <div role="alert" className="bg-danger/10 text-danger text-xs px-3 py-2 rounded-lg mt-3">
          {error}
        </div>
      )}
    </div>
  )
}
