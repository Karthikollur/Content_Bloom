export function validateNextParam(nextParam: string | null): string {
  if (!nextParam) return '/dashboard'
  return /^\/[^/\\]/.test(nextParam) ? nextParam : '/dashboard'
}
