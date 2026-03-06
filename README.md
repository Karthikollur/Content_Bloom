# ContentBloom - AI Content Repurposing Engine

Transform one piece of content into platform-optimized outputs for LinkedIn, X/Twitter, newsletters, and more — preserving your unique brand voice.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage)
- **AI:** Claude API (Sonnet) + Deepgram Nova-2
- **Payments:** Stripe
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project
- API keys for Anthropic, Deepgram, and Stripe

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `ANTHROPIC_API_KEY` | Claude API key |
| `DEEPGRAM_API_KEY` | Deepgram API key |
| `GOOGLE_AI_API_KEY` | Google AI API key (Gemini Flash for free tier) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | App URL (default: http://localhost:3000) |

### 3. Database Setup

Run the initial migration against your Supabase project:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Or manually run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.

The migration creates:
- `profiles` - User profiles with plan info
- `brand_voices` - Brand voice settings
- `assets` - Uploaded source content
- `outputs` - Generated platform content
- `usage_logs` - API cost tracking
- Row Level Security policies on all tables
- Auto-create profile trigger on user signup

### 4. Supabase Storage

Create a storage bucket named `assets` in your Supabase dashboard:
1. Go to Storage in Supabase
2. Create a new bucket called `assets`
3. Set it to public (for file URL access)

### 5. Supabase Auth

Enable the following auth providers in Supabase:
1. **Email/Password** - enabled by default
2. **Google OAuth** - configure in Authentication > Providers > Google

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development Workflow

### Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build + type check
npm run lint         # ESLint check
npm test             # Run tests (watch mode)
npm run test:run     # Run tests once
```

### Pre-Commit Hooks

Husky + lint-staged runs automatically on commit:
- ESLint fix on `.ts/.tsx` files
- Prettier formatting on all staged files

### File Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase, named exports | `UploadZone.tsx` |
| Utilities/hooks | camelCase | `useAssets.ts` |
| API routes | lowercase | `/api/upload/route.ts` |
| Types | PascalCase interfaces | `interface Asset {}` |
| DB columns | snake_case | `assets_used_this_month` |

### Architecture Rules

1. All external API calls go through `/api/` routes — never from the client
2. All API keys in `.env.local` — never hardcoded
3. Every API call logged to `usage_logs` with cost
4. Plan limits enforced server-side
5. Row Level Security on all database tables

## Project Structure

```
src/
  app/
    (auth)/           # Login, signup, OAuth callback
    (dashboard)/      # Protected dashboard pages
    api/              # Backend API routes
  components/
    features/         # Feature components (UploadZone, AssetList, etc.)
    layouts/          # Sidebar, Header
    ui/               # Base UI components
  lib/
    supabase/         # Supabase client/server setup
    ai/               # Claude, Deepgram, prompt templates
    stripe/           # Plan definitions
    utils/            # Helpers, constants
  hooks/              # Custom React hooks
  types/              # TypeScript type definitions
  tests/              # Unit and integration tests
supabase/
  migrations/         # Database migration files
```

## Phase 1 Scope (Current)

- User authentication (email/password + Google OAuth)
- Dashboard with asset list
- File upload (audio/video) with drag-and-drop
- Text/URL content input
- Asset status tracking
- Brand voice settings
- Billing page with plan display

## Testing

```bash
# Run all tests
npm run test:run

# Watch mode
npm test

# Build check (catches type errors)
npm run build

# Lint check
npm run lint
```

## Deployment

Deploy to Vercel:

1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel project settings
3. Deploy — every push to `main` auto-deploys

## License

Private — All rights reserved.
