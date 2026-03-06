# Product Requirements — ContentBloom

## Core User Story
"As a content creator, I upload one podcast episode / blog post / video and get publish-ready posts for LinkedIn, X/Twitter, and my newsletter — all matching my brand voice — in under 5 minutes."

---

## P0 — Must Have (Launch Blockers)

### 1. Source Content Upload & Processing
- Upload audio (MP3, WAV, M4A), video (MP4, MOV), or paste text/URL
- File uploads up to 500MB with resumable uploads
- YouTube URL extracts audio for processing
- Blog URL extracts article text
- Processing status indicator shows progress

### 2. AI Platform Outputs — LinkedIn
- Hook line, structured body, CTA, 3–5 hashtags
- Respects ~3,000 character limit
- Professional thought-leadership tone by default
- Line breaks optimized for LinkedIn feed

### 3. AI Platform Outputs — X/Twitter Thread
- Thread of 3–8 tweets, each under 280 characters
- Numbered (1/N format)
- Compelling hook in first tweet, CTA in last
- Coherent narrative, not random excerpts

### 4. AI Platform Outputs — Newsletter Snippet
- 200–400 words, email-ready format
- Subject line suggestion included
- Short paragraphs, bold key points, CTA
- Copy-paste ready for Substack/Beehiiv/ConvertKit

### 5. Audio/Video Transcription
- Deepgram Nova-2 for transcription
- Speaker labels for multi-speaker content
- 30-minute episode processes in under 3 minutes
- English only for MVP

### 6. Brand Voice Customization
- Natural language voice description
- Paste 2–3 examples of existing writing
- All outputs reflect defined voice
- Voice settings persist across sessions

### 7. User Authentication & Dashboard
- Email/password + Google OAuth (Supabase Auth)
- Dashboard shows all source content with status
- Expandable items show generated outputs
- Copy-to-clipboard on every output
- Asset count tracking for plan limits

### 8. Subscription & Payments (Stripe)
- **Free ($0):** 1 asset/month, 15-min max, watermarked, Gemini Flash
- **Creator ($19):** 5 assets/month, all platforms, brand voice, Claude Sonnet
- **Pro ($49):** 20 assets/month, priority processing, output history, bulk export
- **Agency ($99):** Unlimited, team seats (v2), white-label (v2)
- Stripe Checkout integration
- Usage meter visible in dashboard

---

## P1 — Should Have (Ship Within 4 Weeks Post-Launch)

### 9. Bulk Export (ZIP/CSV)
- Download all outputs for an asset as ZIP
- For creators using Buffer/Hootsuite/etc.

### 10. Instagram Caption Output
- Instagram-optimized caption with hashtags and emoji

### 11. YouTube Shorts Script
- 30–60 second script from source content
- Text script only — no video rendering in v1

### 12. Output Editing & Regeneration
- Inline editing of any output
- "Regenerate" button for new versions

---

## P2 — v2 Roadmap (Not in MVP)
- Content Calendar & Scheduling (Month 3–4)
- Direct Publishing to Platforms (Month 4–5)
- Video Clip Generation via Shotstack (Month 3)
- Team Collaboration (Month 5+)
- Analytics Dashboard (Month 4)
- Multi-language Support (Month 6)

## P3 — Won't Have (Out of Scope Permanently for Now)
- In-app advanced video editor
- Native mobile app (iOS/Android)
- AI image/carousel generation
- Real-time collaboration

---

## Success Metrics

### North Star
**Monthly assets processed per active user**

### MVP OKRs (First 90 Days)
- 100 registered users within 60 days
- 30% free→paid conversion within 30 days
- Average user processes 3+ assets in first month
- $500 MRR by day 60
- Monthly API costs below 15% of revenue
- 80% of outputs used without major editing

### What to Track
| Metric | Tool |
|--------|------|
| Signups, source channel | PostHog |
| First asset within 24hrs | PostHog |
| Weekly active users | PostHog |
| MRR, conversion, churn | Stripe Dashboard |
| API spend per user | Custom (usage_logs table) |
| Copy-click rate, regeneration rate | PostHog custom events |
