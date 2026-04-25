export function isInsufficientSource(content: string): boolean {
  return content.trim().startsWith('INSUFFICIENT_SOURCE')
}
