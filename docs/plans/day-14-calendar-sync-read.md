# Day 14 — Calendar sync read: fetch Google events → store snapshot

## Prerequisites
- Day 13 complete (Google connected and refresh token stored).
- Worker can access DB.

## Goal
Implement “Sync my calendar” (read) that imports Google Calendar events into the app as a snapshot.

## Definition of done
- API endpoint `POST /calendar/google/sync` enqueues a job (does not call Google directly).
- Worker processes job:
  - Uses refresh token to obtain access token
  - Calls Google Calendar API to list events (primary calendar is fine for MVP)
  - Upserts events into `SyncedCalendarEvent`
- API endpoint `GET /calendar/google/events` returns stored events for the user.
- Metrics and logs added for job duration/failures (basic counters/histogram).

## Implementation plan

### 1) Data model (Prisma)
Add `SyncedCalendarEvent`:
- `id`, `userId`, `provider` ('GOOGLE'), `providerEventId` (unique per user/provider), `summary`, `startAt`, `endAt`, `updatedAt`, `rawJson` (optional)
- `@@unique([userId, provider, providerEventId])`

Migration name:
- `calendar_sync_read`

### 2) API endpoints
- `POST /calendar/google/sync`
  - Auth required
  - Validates user has a Google connection
  - Enqueues SQS job (if SQS local not ready, fallback: in-process queue for now, but keep interface identical)
- `GET /calendar/google/events`
  - Auth required
  - Pagination optional (MVP: limit 100; order by startAt desc)

### 3) Worker job
Job payload:
- `{ userId: string, provider: 'GOOGLE' }`

Processing:
- Fetch connection row
- Exchange refresh token for access token
- Call Google Calendar “events.list”:
  - timeMin = now - 30 days
  - timeMax = now + 180 days
- Upsert into `SyncedCalendarEvent`

### 4) Observability (minimum)
- Counter: `worker_jobs_total{type="google_calendar_sync",status="success|failure"}`
- Histogram: `worker_job_duration_seconds{type="google_calendar_sync"}`
- Log: userId, count of events upserted, google request errors

## Suggested order of implementation
1. Prisma models/migration
2. Worker Google token exchange helper
3. Worker calendar events fetch + upsert
4. API enqueue endpoint
5. API list endpoint
6. Metrics + logs
7. Manual test

## Summary checklist
- [ ] Sync job enqueued via API
- [ ] Worker imports events and upserts DB
- [ ] User can fetch imported events
- [ ] Metrics/logging present