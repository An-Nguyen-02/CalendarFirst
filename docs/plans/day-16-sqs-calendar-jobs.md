# Day 16 — SQS jobs for calendar sync + retries + DLQ (local + AWS-ready)

## Prerequisites
- Day 14–15 jobs exist conceptually (enqueue + worker handlers).
- apps/worker exists.

## Goal
Formalize job queueing using SQS-compatible interface locally and make it ready for AWS.

## Definition of done
- A queue abstraction exists: `enqueueJob(job)` and `processJobs(handlerMap)`
- Local dev works:
  - either LocalStack SQS OR a minimal in-memory dev queue with same interface (prefer LocalStack)
- Retries:
  - A job failure is retried N times (MVP: 3) with backoff
- DLQ:
  - After retries exhausted, send to DLQ (or mark as dead-letter in DB for local fallback)
- Metrics:
  - queue depth (if available), processed total, failed total, DLQ total

## Implementation plan

### 1) Choose local approach
Preferred:
- LocalStack with SQS enabled in docker-compose
- Create queues: `calsync-jobs` and `calsync-jobs-dlq`

Alternative (if you avoid LocalStack):
- DB-backed queue table for local only, but keep API identical.

### 2) Queue module
Create `apps/api/src/lib/queue.ts` and `apps/worker/src/lib/queue.ts` (or shared package):
- `enqueueJob({ type, payload, idempotencyKey? })`
- Message format includes:
  - `type`, `payload`, `attempt`, `createdAt`
- In worker, on failure:
  - increment attempt
  - re-enqueue with delay
  - after attempt > 3, send to DLQ

### 3) Worker processing loop
- Poll messages continuously with long polling
- For each message:
  - parse + validate
  - call handler
  - delete message if success
  - retry logic if failure

### 4) Update Day 14/15 to use queue module
- Replace any in-process stubs with queue module usage.

## Suggested order of implementation
1. LocalStack setup + queues
2. Queue abstraction module
3. Worker poll loop + retry/DLQ
4. Wire calendar sync job
5. Wire calendar write job
6. Metrics + tests

## Summary checklist
- [ ] Jobs flow through SQS locally
- [ ] Retries and DLQ work
- [ ] Metrics/logs exist
- [ ] API/worker both use shared queue module