# CalSync Events

Calendar-first event management and ticketing platform.

## Tech Stack
- Node.js + Express + TypeScript
- Next.js (minimal UI)
- PostgreSQL (Docker)
- Redis (Docker)
- AWS (planned)

## Current Status
**Days 1–12 complete.** See [docs/MVP_PLAN.md](docs/MVP_PLAN.md) for the day register and next steps. Latest: Day 12 — order confirmation email (Resend) when order is marked PAID via Stripe webhook. Next: Day 13.

## Run locally

1. **Start Postgres and Redis**
   ```bash
   docker compose up -d
   ```

2. **Install dependencies** (from repo root)
   ```bash
   npm install
   ```

3. **Run API** (terminal 1)
   ```bash
   cd apps/api && npm run dev
   ```
   API listens on http://localhost:4000. `curl http://localhost:4000/health` returns `{"status":"ok","timestamp":"..."}`.

4. **Run Web** (terminal 2)
   ```bash
   cd apps/web && npm run dev
   ```
   Open http://localhost:3000 — the page shows API status from `/api/health` (Next rewrites `/api/*` to the API).

5. **Optional:** Run worker stub
   ```bash
   cd apps/worker && npm run dev
   ```
