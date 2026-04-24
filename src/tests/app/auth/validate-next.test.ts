import { describe, it, expect } from 'vitest'
import { validateNextParam } from '@/app/auth/callback/validate-next'

describe('validateNextParam', () => {
  describe('safe paths — pass through unchanged', () => {
    it('accepts a simple dashboard path', () => {
      expect(validateNextParam('/dashboard')).toBe('/dashboard')
    })

    it('preserves query strings', () => {
      expect(validateNextParam('/dashboard?tab=billing')).toBe('/dashboard?tab=billing')
    })

    it('accepts nested paths', () => {
      expect(validateNextParam('/dashboard/asset/abc123')).toBe('/dashboard/asset/abc123')
    })

    it('accepts reset-password path', () => {
      expect(validateNextParam('/reset-password')).toBe('/reset-password')
    })
  })

  describe('missing / empty input — falls back to /dashboard', () => {
    it('defaults when null', () => {
      expect(validateNextParam(null)).toBe('/dashboard')
    })

    it('defaults when empty string', () => {
      expect(validateNextParam('')).toBe('/dashboard')
    })
  })

  describe('open-redirect attack vectors — all rejected', () => {
    it('rejects protocol-relative URL', () => {
      expect(validateNextParam('//evil.com')).toBe('/dashboard')
    })

    it('rejects absolute https URL', () => {
      expect(validateNextParam('https://evil.com')).toBe('/dashboard')
    })

    it('rejects absolute http URL', () => {
      expect(validateNextParam('http://evil.com')).toBe('/dashboard')
    })

    it('rejects backslash-prefixed path (browsers may normalize \\ to /)', () => {
      expect(validateNextParam('/\\evil.com')).toBe('/dashboard')
    })

    it('rejects javascript: scheme', () => {
      expect(validateNextParam('javascript:alert(1)')).toBe('/dashboard')
    })

    it('rejects data: scheme', () => {
      expect(validateNextParam('data:text/html,<script>alert(1)</script>')).toBe('/dashboard')
    })

    it('rejects path not starting with slash', () => {
      expect(validateNextParam('dashboard')).toBe('/dashboard')
    })

    it('rejects bare slash', () => {
      expect(validateNextParam('/')).toBe('/dashboard')
    })
  })
})
