# Code Patterns & Style — ContentBloom

## Project Structure
```
contentbloom/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout (dark theme, fonts)
│   │   ├── page.tsx              # Landing page
│   │   ├── (auth)/               # Auth pages
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/          # Protected pages (require login)
│   │   │   ├── layout.tsx        # Dashboard layout (sidebar, nav)
│   │   │   ├── page.tsx          # Dashboard home (asset list)
│   │   │   ├── upload/page.tsx
│   │   │   ├── asset/[id]/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── billing/page.tsx
│   │   └── api/                  # Backend API routes
│   │       ├── upload/route.ts
│   │       ├── process/route.ts
│   │       ├── outputs/route.ts
│   │       ├── voice/route.ts
│   │       └── billing/
│   │           ├── checkout/route.ts
│   │           └── webhook/route.ts
│   ├── components/
│   │   ├── ui/                   # Base UI (shadcn/ui components)
│   │   ├── features/             # Feature-specific components
│   │   │   ├── UploadZone.tsx
│   │   │   ├── OutputTabs.tsx
│   │   │   ├── OutputCard.tsx
│   │   │   ├── AssetList.tsx
│   │   │   ├── VoiceEditor.tsx
│   │   │   ├── UsageMeter.tsx
│   │   │   └── ProcessingStatus.tsx
│   │   └── layouts/              # Shared layouts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser Supabase client
│   │   │   ├── server.ts         # Server Supabase client
│   │   │   └── middleware.ts     # Auth middleware
│   │   ├── ai/
│   │   │   ├── claude.ts         # Claude API wrapper
│   │   │   ├── deepgram.ts       # Deepgram API wrapper
│   │   │   └── prompts/
│   │   │       ├── linkedin.ts
│   │   │       ├── twitter.ts
│   │   │       ├── newsletter.ts
│   │   │       └── types.ts
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   └── plans.ts
│   │   └── utils/
│   │       ├── constants.ts
│   │       └── helpers.ts
│   ├── hooks/
│   │   ├── useAssets.ts
│   │   ├── useOutputs.ts
│   │   └── useSubscription.ts
│   └── types/
│       ├── database.ts           # Auto-generated from Supabase
│       └── api.ts
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── public/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── AGENTS.md
├── CLAUDE.md
└── agent_docs/
```

## Naming Conventions
- **Files:** Components = `PascalCase.tsx`, utilities = `camelCase.ts`, API routes = `lowercase/route.ts`
- **Variables:** `camelCase` for variables and functions
- **Types/Interfaces:** `PascalCase` — e.g., `interface Asset { ... }`
- **Constants:** `UPPER_SNAKE_CASE` — e.g., `const MAX_FILE_SIZE = 500_000_000`
- **Database columns:** `snake_case` — e.g., `assets_used_this_month`
- **CSS classes:** Tailwind utilities only — no custom CSS files

## Component Pattern

All components use named exports (except page.tsx/layout.tsx which must be default exports):

```typescript
// components/features/OutputCard.tsx
'use client'

import { useState } from 'react'
import { Copy, RefreshCw, Check } from 'lucide-react'

interface OutputCardProps {
  platform: string
  content: string
  onRegenerate: () => Promise<void>
}

export function OutputCard({ platform, content, onRegenerate }: OutputCardProps) {
  const [copied, setCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      await onRegenerate()
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium capitalize">{platform}</h3>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="text-text-secondary hover:text-text-primary">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button onClick={handleRegenerate} disabled={isRegenerating} className="text-text-secondary hover:text-text-primary">
            <RefreshCw size={16} className={isRegenerating ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      <p className="text-text-secondary whitespace-pre-wrap">{content}</p>
    </div>
  )
}
```

## API Route Pattern

```typescript
// app/api/process/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request
    const body = await request.json()
    const { assetId } = body

    // 3. Business logic
    // ... (process the asset)

    // 4. Return response
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Process error:', error)
    return NextResponse.json(
      { error: 'Processing failed. Please try again.' },
      { status: 500 }
    )
  }
}
```

## Dark Theme Design Tokens

```typescript
// tailwind.config.ts — color palette
colors: {
  background: '#0A0A0A',         // Near-black background
  surface: '#141414',            // Card/panel background
  'surface-hover': '#1C1C1C',   // Hover state
  border: '#262626',             // Subtle borders
  'text-primary': '#FAFAFA',     // Primary text
  'text-secondary': '#A1A1AA',   // Muted text (zinc-400)
  'text-tertiary': '#52525B',    // Very muted (zinc-600)
  accent: '#10B981',             // Emerald green (bloom theme)
  'accent-hover': '#059669',     // Darker green hover
  'accent-soft': '#10B98115',    // Green with low opacity
  danger: '#EF4444',             // Red for errors
  warning: '#F59E0B',            // Amber for usage warnings
}
```

### Common UI Patterns
```
Card:           bg-surface border border-border rounded-lg p-6
Primary button: bg-accent hover:bg-accent-hover text-background font-medium px-4 py-2 rounded-lg
Ghost button:   text-text-secondary hover:text-text-primary hover:bg-surface-hover px-3 py-1.5 rounded-md
Input:          bg-background border border-border text-text-primary placeholder:text-text-tertiary rounded-lg px-3 py-2
Badge success:  bg-accent-soft text-accent text-xs px-2 py-0.5 rounded-full
Badge warning:  bg-warning/10 text-warning text-xs px-2 py-0.5 rounded-full
Badge error:    bg-danger/10 text-danger text-xs px-2 py-0.5 rounded-full
```

## Error Handling Pattern

Always catch errors and show user-friendly messages:

```typescript
// In components
try {
  const response = await fetch('/api/process', { method: 'POST', body: JSON.stringify({ assetId }) })
  if (!response.ok) {
    const { error } = await response.json()
    throw new Error(error || 'Something went wrong')
  }
  const data = await response.json()
  // success path
} catch (error) {
  // Show toast notification or inline error
  setError(error instanceof Error ? error.message : 'An unexpected error occurred')
}
```

## Supabase Client Pattern

```typescript
// lib/supabase/client.ts — for use in browser components
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts — for use in API routes and server components
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}
```

## Import Order Convention
1. React/Next.js imports
2. Third-party libraries
3. Internal lib/ imports
4. Component imports
5. Type imports
6. Constants

```typescript
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Copy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { OutputCard } from '@/components/features/OutputCard'
import type { Asset } from '@/types/database'
import { PLANS } from '@/lib/stripe/plans'
```
