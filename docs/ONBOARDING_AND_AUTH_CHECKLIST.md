# Onboarding, Auth, and Data Persistence – Implementation Checklist

This document tracks the end-to-end fixes and improvements for signup/auth, AI-driven onboarding (10-step, gamified), data persistence, and performance. Each item is actionable and checked off as implemented.

## Goals
- New users persist reliably in MongoDB (local fallback in dev) at signup.
- JWT works across API, middleware, and client; no redirect loops or “stuck verifying”.
- Onboarding: robust 10-question flow, multi-part prompt design, handles short answers with guidance, and stores all Q/A and summaries in DB.
- Dashboard uses stored data (activities, progress, profile snapshot).
- Performance: avoid long “verifying” states and reduce redundant calls; reuse DB connection.

## Environment and DB
- [x] Use `MONGODB_URI` when valid; fall back to `mongodb://localhost:27017` in dev.
- [x] One shared connection with pool; ping on connect; reuse across requests.
- [x] Index bootstrap on connect with predictable [spec, options] tuples.
- [x] Debug endpoint to rebuild indexes.
- [ ] Debug endpoint to list users and DB stats (added in this pass).

## Schemas/Collections/Indexes
- [x] Users: unique index on `email` and timestamps.
- [x] User Progress: unique index on `userId`.
- [x] Activities: indexes on `userId,timestamp`, `type`.
- [x] Onboarding Conversations store (vector-ish embedding) – ensure indexed by `userId`.
- [x] Onboarding History collection to store each Q/A with `sessionId`, `stage`, `idx`.

## Auth and Middleware
- [x] Server APIs require Bearer token; onboarding endpoints cross-check token.userId with body.userId.
- [x] Middleware protects only dashboard/profile; onboarding page left public to avoid loops.
- [x] AuthContext verifies token on load; sets cookie+localStorage on sign-in/up.
- [x] Cookie-set redirect helper to avoid middleware bounce.
- [x] Add verify() timeout and fallback to prevent “stuck verifying” banner.

## Onboarding UX + AI
- [x] Cap at 10 user questions; append [DONE] on completion.
- [x] Multi-part prompt design: base prompt + personalization + stage-aware guidance.
- [x] Strong guidance for richer answers; detect short replies and follow up.
- [x] Persist each Q/A to `onboardingHistory` and session-level to `onboarding_conversations`.
- [x] Finalize endpoint persists profile summary and marks `completedOnboarding`.

## Dashboard and Personalization
- [x] API endpoints for `progress`, `activities`, `profile`, `projects`, and lightweight `dashboard` AI hints.
- [x] Activity logging for signup, onboarding interactions, and completion.
- [x] Dashboard shows activity feed + profile snapshot.

## Performance and DX
- [x] Avoid duplicate connection attempts (serialize connect).
- [x] Reduce “verifying” stall via timeout.
- [x] Minor retries on first onboarding call for warm-up.
- [ ] Consider dynamic imports/code-splitting for heavy landing visuals (optional follow-up).

## Validation Steps
1) Start dev server and confirm “Connected to local MongoDB successfully” if Atlas is unavailable.
2) Hit `POST /api/auth/signup` via UI; confirm user in local MongoDB (db `studioai`, collection `users`).
3) Complete onboarding; verify `onboarding_conversations` and `onboardingHistory` contain entries; `users.completedOnboarding = true`.
4) Open dashboard; see profile snapshot and recent activities (signup, onboarding completed).
5) If indexes are wrong (warnings), call `POST /api/debug/rebuild-indexes` with Bearer token.
6) Use `GET /api/debug/users` to list users and counts.

## Known Notes
- In dev, React Strict Mode can trigger duplicate logs/effects; redirects are guarded with cookie-ready logic.
- Without a Gemini API key, the flow uses robust fallbacks.
