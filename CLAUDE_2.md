# CLAUDE.md — Claude Code Configuration for ContentBloom

## Project Context
**App:** ContentBloom — AI Content Repurposing Engine
**Stack:** Next.js 14 · TypeScript · Supabase · Claude API · Deepgram · Stripe · Tailwind CSS · Vercel
**Stage:** MVP Development
**User Level:** Vibe-coder (wants to understand what's built)

## Directives
1. **Master Plan:** Always read `AGENTS.md` first. It contains the current phase, active tasks, and project state.
2. **Documentation:** Refer to `agent_docs/` for tech stack details, code patterns, and testing guides. Load only the file you need.
3. **Plan-First:** Propose a brief plan and wait for approval before coding. Say what files you'll create/modify.
4. **Incremental Build:** Build one small feature at a time. Test after each. Never implement multiple features at once.
5. **Pre-Commit:** Run `npm run lint` before commits. Fix failures before proceeding.
6. **No Linting Role:** Do not act as a linter in conversation. Use `npm run lint` if code style needs checking.
7. **Communication:** Be concise but educational. Explain decisions briefly since the user is learning.
8. **Cost Awareness:** ContentBloom's #1 concern is cost control. Flag any decision that increases API costs.

## Commands
- `npm run dev` — Start development server (http://localhost:3000)
- `npm run build` — Production build (catches type errors)
- `npm run lint` — Check code style
- `npm test` — Run tests (when configured)
- `npx supabase db push` — Push database migrations
- `npx supabase gen types typescript --local > src/types/database.ts` — Regenerate DB types

## Key Architecture Rules
- All API keys live in `.env.local` — NEVER hardcode them
- All external API calls (Claude, Deepgram, Stripe) happen in `/api/` routes — NEVER from the client
- All database tables use Row Level Security — users only see their own data
- Free tier uses Gemini Flash; paid tiers use Claude Sonnet — check plan before choosing LLM
- Every API call gets logged to `usage_logs` table with cost

## File Conventions
- Components: PascalCase (`UploadZone.tsx`)
- Utilities/hooks: camelCase (`useAssets.ts`)
- API routes: lowercase (`/api/process/route.ts`)
- Types: PascalCase interfaces (`interface Asset { ... }`)
- No default exports for components (use named exports)
- Exception: page.tsx and layout.tsx use default exports (Next.js requirement)

## What NOT To Do
- Do NOT delete files without explicit confirmation
- Do NOT modify database schemas without explaining the migration
- Do NOT add features not in the current phase of AGENTS.md
- Do NOT skip error handling
- Do NOT use `any` type — use `unknown` with type guards
- Do NOT install packages without checking existing dependencies first
- Do NOT bypass failing lint or tests
