# Day 13 — Google OAuth connect (login + token storage)

## Setup (env)
- **API** (`apps/api/.env`): `ENCRYPTION_KEY` (32 bytes, base64; generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BASE_URL` (web app URL for post-callback redirect), `API_PUBLIC_URL` (this API’s public URL for OAuth redirect_uri, e.g. `http://localhost:4000`).
- **Worker** (for smoke test): `DATABASE_URL`, `ENCRYPTION_KEY`. Run from repo root: `cd apps/worker && npm run prisma:generate && npm run smoke:decrypt` (after at least one Google connection exists).
- **Google Cloud Console:** Create OAuth 2.0 credentials (Web application), set authorized redirect URI to `{API_PUBLIC_URL}/auth/google/callback`.

## Prerequisites
- Day 12 complete (email on order paid).
- API and worker run locally.
- ENV management exists for API/worker.
- You have a Google Cloud project and can create OAuth credentials.

## Goal
Users can connect their Google account to CalSync via OAuth, and we can securely store refresh tokens for later calendar operations.

## Definition of done
- Google OAuth flow works end-to-end in local dev:
  - `GET /auth/google/start` (with Bearer token) returns `{ redirectUrl }`; frontend redirects user to Google
  - `GET /auth/google/callback` exchanges code for tokens
- Tokens are stored server-side in DB with encryption at rest (app-level encryption at minimum).
- `GET /integrations/google` shows whether Google is connected (not `/me`).
- Worker can decrypt and use stored refresh token (smoke test only; no calendar calls yet).
- Zod validation for callback params/state where applicable.
- No secrets committed.

## Implementation plan

### 1) Data model (Prisma)
Add tables:
- `CalendarConnection`:
  - `id`, `userId`, `provider` ('GOOGLE'), `encryptedRefreshToken`, `scopes`, `email`, `createdAt`, `updatedAt`
  - `@@unique([userId, provider])`

Run migration:
- `npx prisma migrate dev --name calendar_connection`

### 2) Token encryption utility
Add a small crypto helper in API and worker (shared package preferred):
- Use AES-256-GCM with `ENCRYPTION_KEY` (32 bytes base64) and random IV.
- Provide:
  - `encrypt(plaintext) -> {ciphertext, iv, tag}`
  - `decrypt({ciphertext, iv, tag}) -> plaintext`
Store encrypted blob as JSON string or separate columns (either is OK; JSON string simplest for MVP).

### 3) Google OAuth endpoints (API)
Endpoints:
- `GET /auth/google/start`
  - Requires `requireAuth` (your JWT auth), because connection is per logged-in user.
  - Generates `state` (random) and stores it short-lived (DB or Redis). MVP: store in DB table `OAuthState` or in Redis with TTL 10 min.
  - Redirects to Google authorize URL with required scopes:
    - `https://www.googleapis.com/auth/calendar.readonly`
    - `https://www.googleapis.com/auth/calendar.events`
- `GET /auth/google/callback`
  - Validates `code` and `state` with Zod
  - Verifies `state` belongs to that user and is not expired
  - Exchanges code for tokens using Google OAuth token endpoint
  - Stores encrypted refresh token and basic metadata (provider email if available from `id_token` or separate call)
  - Redirects back to web app (e.g. `/settings/integrations?connected=1`)

### 4) Connection status endpoint
Add:
- `GET /integrations/google`
  - Requires auth
  - Returns `{ connected: boolean, email?: string, scopes?: string[] }`

### 5) Web UI (minimal)
Add a settings page or button:
- “Connect Google Calendar” → calls API `/auth/google/start` (browser redirect)
- Show connected status

### 6) Smoke test
- Log in, connect Google, confirm `calendar_connections` row created.
- Ensure worker can decrypt refresh token (simple CLI job or a temporary endpoint guarded by admin/dev flag).

## Suggested order of implementation
1. Prisma model + migration
2. Encryption helper
3. OAuth state storage (Redis preferred; DB ok)
4. `/auth/google/start` + `/auth/google/callback`
5. `/integrations/google` status endpoint
6. Minimal web button and redirect handling
7. Smoke test + cleanup

## Summary checklist
- [x] Prisma migration applied (OAuthState + CalendarConnection)
- [x] Encryption in `@calsync/shared` (AES-256-GCM), ENCRYPTION_KEY required
- [x] OAuth start (returns redirectUrl) / callback working locally
- [x] Refresh token stored encrypted
- [x] GET /integrations/google connection status endpoint
- [x] Web settings/integrations page with connect button + status
- [x] Worker smoke:decrypt script to verify decrypt