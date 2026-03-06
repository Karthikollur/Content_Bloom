# Project Brief — ContentBloom (Persistent)

## Product Vision
ContentBloom transforms one piece of content into platform-optimized outputs for LinkedIn, X/Twitter, newsletters, and more — preserving the creator's unique brand voice.

## Target Users
1. **Solo creators** — Produce 1-2 long-form pieces/week, hate the 5-10 hour reformatting grind
2. **B2B marketers** — Manage multi-platform distribution for clients
3. **Podcast hosts** — Great at speaking, need help turning episodes into written content

## Key Differentiator
No existing tool combines: multi-format input (audio + video + text) → AI text generation → brand voice customization → multi-platform output. Castmagic comes closest but lacks scheduling, text input, and video support.

## Coding Conventions
- **Language:** TypeScript (strict mode) — no `any` types
- **Framework:** Next.js 14 App Router
- **Styling:** Tailwind CSS utility classes only — no custom CSS files
- **Components:** Named exports, PascalCase filenames
- **Database:** snake_case column names
- **API routes:** lowercase paths
- **State:** React hooks only (no Redux/Zustand for MVP)

## Quality Gates
- `npm run lint` must pass before every commit
- `npm run build` must succeed (catches type errors)
- Every API route must handle auth, validation, and errors
- Every user-facing action must have loading + error states
- All database queries must respect RLS policies

## Key Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build + type check
npm run lint         # ESLint check
npm test             # Run tests (when configured)
npx supabase db push # Push DB migrations
```

## Architecture Rules
1. **No client-side API calls to external services** — All Claude, Deepgram, Stripe calls go through `/api/` routes
2. **No hardcoded keys** — Everything in `.env.local`
3. **Cost tracking on every API call** — Log to `usage_logs` table
4. **Plan limits enforced server-side** — Never trust the client
5. **Resumable uploads** — Large files (audio/video) must use Supabase resumable uploads

## Design Aesthetic
Dark & techy (Vercel/Raycast vibe):
- Background: `#0A0A0A` (near-black)
- Cards: `#141414` with `#262626` borders
- Text: `#FAFAFA` primary, `#A1A1AA` secondary
- Accent: `#10B981` (emerald green — the "bloom" color)
- Fonts: Inter (body), JetBrains Mono (code/technical elements)

## Budget Constraint
Monthly dev cost must stay under $50. User's #1 concern is costs getting out of control.
- Use free tiers aggressively
- Gemini Flash for free-tier users (40x cheaper than Claude)
- Hard usage caps per plan — no unlimited anything
- Log every API cost to `usage_logs`

## Update Cadence
Update this file + AGENTS.md "Current State" section at the end of every coding session.
