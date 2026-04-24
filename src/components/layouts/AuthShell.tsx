import type { ReactNode } from 'react'

interface AuthShellProps {
  children: ReactNode
  footer?: ReactNode
}

export function AuthShell({ children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-background font-bold text-sm">CB</span>
          </div>
          <span className="text-text-primary font-semibold text-lg">ContentBloom</span>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">{children}</div>

        {footer && <p className="text-text-tertiary text-sm text-center mt-4">{footer}</p>}
      </div>
    </div>
  )
}
