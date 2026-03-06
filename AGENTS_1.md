# AGENTS.md — Master Plan for ContentBloom

## Project Overview
**App:** ContentBloom — AI Content Repurposing Engine
**Goal:** Upload one piece of content (podcast, video, blog) → get platform-optimized outputs for LinkedIn, X/Twitter, newsletters, and more
**Stack:** Next.js 14 · TypeScript · Supabase · Claude API · Deepgram · Stripe · Tailwind CSS · Vercel
**Current Phase:** Phase 1 — Foundation
**Builder:** Vibe-coder learning while building. Explain decisions clearly. No jargon without context.

## How I Should Think
1. **Understand Intent First**: Before coding, identify what the user actually needs. They're learning — context matters.
2. **Ask If Unsure**: If critical information is missing, ask ONE specific clarifying question before proceeding.
3. **Plan Before Coding**: Propose a brief plan and wait for approval before implementing.
4. **Verify After Changes**: Run `npm run dev` and manually verify after each change. Run `npm run lint` before commits.
5. **Explain Trade-offs**: When recommending an approach, briefly mention why it was chosen over alternatives.
6. **Keep It Simple**: This is an MVP. Choose the simplest correct solution. No premature optimization.

## Plan → Execute → Verify
1. **Plan:** Outline what you'll build and which files you'll touch. Ask for approval.
2. **Execute:** Implement one feature at a time. Small, testable increments.
3. **Verify:** After each feature, confirm it works: run the dev server, test the flow, check for errors.

## Context Files
Load these ONLY when needed to avoid context window bloat:
- `agent_docs/tech_stack.md` — Libraries, versions, setup commands, API references
- `agent_docs/code_patterns.md` — Code style, component patterns, naming conventions
- `agent_docs/project_brief.md` — Persistent project rules, conventions, quality gates
- `agent_docs/product_requirements.md` — Full PRD features, user stories, success metrics
- `agent_docs/testing.md` — Test strategy, verification commands, pre-commit hooks

## Current State (UPDATE THIS AFTER EACH SESSION!)
**Last Updated:** [Date]
**Working On:** Phase 1 — Project initialization and auth setup
**Recently Completed:** [None yet — fresh project]
**Blocked By:** None

---

## Roadmap

### Phase 1: Foundation (Weeks 1–3)
- [ ] Initialize Next.js 14 project with TypeScript + Tailwind
- [ ] Configure dark theme (Vercel/Raycast aesthetic — see `agent_docs/code_patterns.md`)
- [ ] Set up Supabase project (database + auth + storage)
- [ ] Create database tables and RLS policies (see `agent_docs/tech_stack.md` for schema)
- [ ] Implement auth: email/password signup + Google OAuth via Supabase
- [ ] Build dashboard layout (sidebar nav, header, main content area)
- [ ] Create asset list page (empty state first, then populated)
- [ ] Build file upload with drag-and-drop + Supabase Storage (resumable uploads)
- [ ] Create asset record in database on upload
- [ ] Add processing status indicator (uploading → uploaded → processing → complete)
- [ ] Deploy to Vercel (connect GitHub repo)
- [ ] Set up pre-commit hooks (lint + format)

**Milestone: User can sign up, log in, upload a file, and see it on their dashboard.**

### Phase 2: Core AI Pipeline (Weeks 4–6)
- [ ] Integrate Deepgram Nova-2 for audio/video transcription
- [ ] Build transcription flow: upload triggers transcription → saves transcript to database
- [ ] Handle transcription errors gracefully (retry, error message to user)
- [ ] Integrate Claude API for content generation
- [ ] Create platform-specific prompt templates:
  - [ ] LinkedIn post prompt (`lib/ai/prompts/linkedin.ts`)
  - [ ] X/Twitter thread prompt (`lib/ai/prompts/twitter.ts`)
  - [ ] Newsletter snippet prompt (`lib/ai/prompts/newsletter.ts`)
- [ ] Build output generation pipeline: transcript → Claude → save outputs to database
- [ ] Build output view page with tabs (LinkedIn / X / Newsletter)
- [ ] Add copy-to-clipboard button on each output
- [ ] Add inline editing for outputs
- [ ] Add "Regenerate" button per output
- [ ] Build brand voice settings page (description + example content)
- [ ] Inject brand voice into all generation prompts
- [ ] Support text/URL input (blog → social, no transcription needed)

**Milestone: User can upload audio → get LinkedIn, X, and newsletter outputs with brand voice.**

### Phase 3: Monetization & Polish (Weeks 7–10)
- [ ] Integrate Stripe: create products, prices, checkout sessions
- [ ] Build subscription management (upgrade, downgrade, cancel)
- [ ] Implement usage metering (assets_used_this_month counter)
- [ ] Enforce plan limits (check before processing)
- [ ] Build billing/usage page (current plan, usage bar, upgrade CTA)
- [ ] Implement free tier with Gemini Flash (cheaper LLM)
- [ ] Add watermark to free tier outputs ("Made with ContentBloom")
- [ ] Add cost logging to usage_logs table (every API call tracked)
- [ ] Set up PostHog analytics (signups, uploads, copy-clicks)
- [ ] Set up Sentry error monitoring
- [ ] Add loading states, empty states, error states everywhere
- [ ] Mobile responsiveness pass
- [ ] Onboarding flow for new users

**Milestone: Fully functional app with payments, analytics, and polish.**

### Phase 4: Beta & Launch (Weeks 11–12)
- [ ] Private beta with 5–10 testers
- [ ] Bug fixes and prompt refinement based on feedback
- [ ] Build landing page (hero, features, pricing, CTA)
- [ ] Product Hunt assets (demo video, screenshots)
- [ ] Public launch

**Milestone: ContentBloom is live and accepting paying customers.**

---

## What NOT To Do
- Do NOT delete files or database tables without explicit user confirmation
- Do NOT modify the database schema without explaining the migration plan first
- Do NOT add features not in the current phase — resist scope creep
- Do NOT skip error handling for "simple" changes
- Do NOT bypass failing lint or tests — fix them first
- Do NOT use deprecated libraries or patterns
- Do NOT hardcode API keys anywhere — always use environment variables
- Do NOT install new npm packages without checking if an existing one covers the need
- Do NOT use `any` type in TypeScript — use `unknown` with type guards if unsure

## Communication Style
- Be concise but educational. This user is learning — explain the "why" briefly.
- When something fails, explain what went wrong in plain English before fixing.
- After implementing a feature, summarize what was built and how to test it.
- Don't apologize for errors — just fix them and explain.
