'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthShell } from '@/components/layouts/AuthShell'
import { Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <AuthShell
      footer={
        <>
          Remember your password?{' '}
          <Link href="/login" className="text-accent hover:text-accent-hover transition-colors">
            Sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div role="status">
          <h1 className="text-text-primary text-xl font-semibold mb-3 text-center">
            Check your inbox
          </h1>
          <p className="text-text-secondary text-sm text-center mb-2">
            We sent a password reset link to
          </p>
          <p className="text-text-primary text-sm text-center font-medium mb-6 break-all">
            {email}
          </p>
          <p className="text-text-tertiary text-xs text-center">
            Didn&apos;t receive it? Check your spam folder, or{' '}
            <button
              type="button"
              onClick={() => {
                setSent(false)
                setError(null)
              }}
              className="text-accent hover:text-accent-hover transition-colors"
            >
              try again
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-text-primary text-xl font-semibold mb-2 text-center">
            Reset your password
          </h1>
          <p className="text-text-secondary text-sm text-center mb-6">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {error && (
            <div
              role="alert"
              className="bg-danger/10 text-danger text-sm px-3 py-2 rounded-lg mb-4"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-text-secondary text-sm mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-background border border-border text-text-primary placeholder:text-text-tertiary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-background font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              Send reset link
            </button>
          </form>
        </>
      )}
    </AuthShell>
  )
}
