# CalSync Events

Calendar-first event management and ticketing platform.

## Tech Stack
- Node.js + Express + TypeScript
- Next.js (minimal UI)
- PostgreSQL (Docker)
- Redis (Docker)
- AWS (planned)

## Current Status
**Day 1 complete.** Monorepo (npm workspaces), Docker Postgres + Redis, Express API with `/health`, Next.js health UI, structured logs (pino) + request-id.

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
