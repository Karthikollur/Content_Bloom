# Testing Strategy — ContentBloom

## Philosophy
This is an MVP built by a solo vibe-coder. Testing should be pragmatic, not exhaustive. Focus on testing the things that would break trust if they fail: payments, auth, and the AI pipeline.

## Testing Tiers

### Tier 1: Always Test (Critical Path)
These must work perfectly or users lose money/data:
- **Auth flow:** Sign up, log in, log out, Google OAuth
- **Upload flow:** File upload succeeds, record created in DB, status updates
- **AI pipeline:** Transcript generated, outputs generated, saved to DB
- **Payments:** Checkout works, plan updates, usage limits enforced
- **RLS:** User A cannot see User B's data

### Tier 2: Smoke Test (Manual)
Check these manually after each feature:
- Dashboard loads with correct data
- Copy-to-clipboard works
- Regenerate button produces new output
- Brand voice settings save and persist
- Usage meter updates after processing
- Error messages show for failed operations

### Tier 3: Nice to Have (Add Later)
- Unit tests for prompt templates
- E2E tests with Playwright
- API route integration tests

## Tools

### Linting (Run Before Every Commit)
```bash
npm run lint        # ESLint — catches code issues
npm run build       # TypeScript — catches type errors
```

### Manual Testing Checklist (Per Feature)
Copy this checklist when completing a feature:

```markdown
- [ ] Feature works in Chrome
- [ ] Feature works in Safari
- [ ] Feature works on mobile viewport (Chrome DevTools → responsive)
- [ ] Loading state shows during async operations
- [ ] Error state shows when operation fails
- [ ] Empty state shows when no data exists
- [ ] Auth: only logged-in users can access
- [ ] Data: only the current user's data is visible
```

### Testing the AI Pipeline
```bash
# Quick test: upload a short audio file (< 1 min) and verify:
1. File appears in Supabase Storage
2. Asset record created with status "uploading" → "uploaded"
3. Transcription runs → status "transcribing" → "transcribed"
4. Generation runs → status "generating" → "complete"
5. Outputs appear in output view
6. Each output matches platform rules (character limits, format)
7. Brand voice is reflected (compare output with and without voice)
8. usage_logs table has cost entries
```

### Testing Payments (Use Stripe Test Mode)
```bash
# Stripe test card numbers:
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
# Requires auth: 4000 0025 0000 3155

# Test flow:
1. Sign up as free user
2. Click upgrade → Stripe Checkout opens
3. Use test card → payment succeeds
4. Profile updates to "creator" plan
5. Asset limit increases from 1 to 5
6. Process 5 assets → 6th is blocked
7. Cancel subscription → reverts to free
```

## Pre-Commit Hooks

Set up with Husky + lint-staged:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

## Verification Loop
After every feature implementation:
1. Run `npm run build` — must succeed (catches type errors)
2. Run `npm run lint` — must pass
3. Manual test the feature in browser
4. Check Supabase dashboard — data looks correct
5. Check browser console — no errors
6. If all pass → commit and move to next feature
7. If any fail → fix before moving on

## When Things Break
1. Check browser console for errors
2. Check Vercel function logs for API errors
3. Check Supabase logs for database errors
4. Ask Claude Code: "I got this error: [error]. The feature I'm building is [feature]. Fix it."
