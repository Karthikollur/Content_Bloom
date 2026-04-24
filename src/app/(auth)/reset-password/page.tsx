'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthShell } from '@/components/layouts/AuthShell'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasRecoverySession(true)
        setChecking(false)
      }
    })

    const timeout = setTimeout(() => setChecking(false), 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.updateUser({ password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    router.push('/login?reset=success')
    router.refresh()
  }

  return (
    <AuthShell>
      {checking ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-text-tertiary" aria-hidden="true" />
        </div>
      ) : !hasRecoverySession ? (
        <>
          <h1 className="text-text-primary text-xl font-semibold mb-3 text-center">
            Link invalid or expired
          </h1>
          <p className="text-text-secondary text-sm text-center mb-6">
            This password reset link is no longer valid. Request a new one to continue.
          </p>
          <Link
            href="/forgot-password"
            className="block w-full text-center bg-accent hover:bg-accent-hover text-background font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Request new link
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-text-primary text-xl font-semibold mb-2 text-center">
            Set a new password
          </h1>
          <p className="text-text-secondary text-sm text-center mb-6">
            Choose a password you haven&apos;t used before.
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
              <label htmlFor="password" className="block text-text-secondary text-sm mb-1.5">
                New password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-background border border-border text-text-primary placeholder:text-text-tertiary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-text-secondary text-sm mb-1.5"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-background border border-border text-text-primary placeholder:text-text-tertiary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                placeholder="Re-enter password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-background font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              Update password
            </button>
          </form>
        </>
      )}
    </AuthShell>
  )
}
