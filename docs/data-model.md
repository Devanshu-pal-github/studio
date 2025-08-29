# Data Model and Events (MongoDB)

Database: `studioai`

Collections:
- `users` — core user profile and onboarding flags
  - Fields: email, name, password (hashed), createdAt, updatedAt, completedOnboarding, optional profile fields (experienceLevel, interests, goals, learningStyle, techStack), learningContext
- `userProgress` — aggregated points, level, streak, goals, activity counters
- `activities` — event log of user actions
  - Example events inserted by APIs: signup, signin, onboarding interaction, onboarding completed
- `onboarding_conversations` — enhanced onboarding conversation + embedding snapshots for personalization

Indexes are created automatically in `src/lib/database/schemas.ts` via `DATABASE_INDEXES` in `src/lib/mongodb.ts`.

Debug endpoints:
- `GET /api/debug/db` — shows active database name and collection counts
- `GET /api/debug/users` — lists first 20 users and dbName; use to align Compass with the app’s DB

Security:
- Auth uses HTTP-only `token` cookie for middleware and Bearer token for API verification.
- `POST /api/onboarding/enhanced` now requires a Bearer token and validates token.userId === body.userId.

Client flow:
- `AuthContext` verifies the token with `/api/auth/verify` on load before redirecting. Landing shows a small “Loading your status…” banner while verification runs.

Event logging:
- `api/auth/signup` → logs an activity (signup)
- `api/auth/signin` → logs an activity (signin)
- `api/onboarding/enhanced` → logs `ai_chat` activity per interaction
- `api/onboarding/finalize` → logs `onboarding completed` as `project_complete`
