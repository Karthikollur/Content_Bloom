# Tech Stack & Tools — ContentBloom

## Frontend
- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Theme:** Dark & techy (Vercel/Raycast aesthetic)
- **State Management:** React hooks (useState, useEffect) — no Redux needed for MVP

### Setup
```bash
npx create-next-app@latest contentbloom --typescript --tailwind --eslint --app --src-dir
cd contentbloom
npm install @supabase/supabase-js @supabase/ssr
```

## Backend
- **API:** Next.js API Routes (`/api/*`) — no separate backend server
- **Serverless Functions:** Vercel serverless (auto-scales, 10s timeout on free tier)
- **For longer tasks:** Supabase Edge Functions (up to 150s) for transcription jobs

## Database & Auth
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **File Storage:** Supabase Storage (resumable uploads for large audio/video)
- **Security:** Row Level Security on ALL tables

### Supabase Setup
```bash
npm install supabase --save-dev
npx supabase init
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Database Schema (5 Tables)

```sql
-- PROFILES (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'creator', 'pro', 'agency')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    assets_used_this_month INT DEFAULT 0,
    billing_cycle_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BRAND VOICES
CREATE TABLE brand_voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    voice_description TEXT NOT NULL,
    example_content TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SOURCE ASSETS (uploaded content)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('audio', 'video', 'text', 'url')),
    source_url TEXT,
    file_size_bytes BIGINT,
    duration_seconds INT,
    transcript TEXT,
    status TEXT DEFAULT 'uploading' CHECK (status IN (
        'uploading', 'uploaded', 'transcribing', 'generating', 'complete', 'failed'
    )),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OUTPUTS (generated platform content)
CREATE TABLE outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN (
        'linkedin', 'twitter', 'newsletter', 'instagram', 'youtube_shorts'
    )),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    version INT DEFAULT 1,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USAGE LOGS (cost tracking)
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    api_provider TEXT NOT NULL,
    tokens_used INT,
    cost_usd DECIMAL(10,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users manage own voices" ON brand_voices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own assets" ON assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own outputs" ON outputs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own usage" ON usage_logs FOR SELECT USING (auth.uid() = user_id);

-- INDEXES
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_outputs_asset_id ON outputs(asset_id);
CREATE INDEX idx_outputs_platform ON outputs(platform);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
```

## AI / LLM APIs
- **Content Generation:** Claude API (Sonnet) for paid users, Gemini Flash for free tier
- **Transcription:** Deepgram Nova-2 ($0.0043/min, best accuracy)

### Claude API Setup
```bash
npm install @anthropic-ai/sdk
```
```typescript
// lib/ai/claude.ts
import Anthropic from '@anthropic-ai/sdk'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
// Model: claude-sonnet-4-5-20250514 for paid tiers
// Always call from API routes — NEVER from client
```

### Deepgram Setup
```typescript
// lib/ai/deepgram.ts
// POST to https://api.deepgram.com/v1/listen
// Headers: Authorization: Token ${DEEPGRAM_API_KEY}
// Body: { url: supabaseStorageUrl, model: 'nova-2', smart_format: true, diarize: true }
```

## Payments
- **Provider:** Stripe
- **Model:** Monthly subscriptions with usage metering

```bash
npm install stripe @stripe/stripe-js
```

### Plan Definitions
| Plan | Price | Assets/mo | LLM | Max Duration |
|------|-------|----------|-----|-------------|
| Free | $0 | 1 | Gemini Flash | 15 min |
| Creator | $19 | 5 | Claude Sonnet | 2 hours |
| Pro | $49 | 20 | Claude Sonnet | 4 hours |
| Agency | $99 | ~unlimited | Claude Sonnet | 8 hours |

## Hosting & Deployment
- **Platform:** Vercel (auto-deploys from GitHub `main` branch)
- **Domain:** Custom domain via Vercel
- **Preview:** Every PR gets a preview URL automatically

## Monitoring
- **Analytics:** PostHog (free tier: 1M events/mo)
- **Errors:** Sentry (free tier sufficient for MVP)
- **Costs:** Custom `usage_logs` table + weekly review

## Environment Variables (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
DEEPGRAM_API_KEY=
GOOGLE_AI_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
