# Day 18 — Production docker-compose on EC2 (single-host deployment)

**Prerequisite:** Day 17 complete (EC2 ready with Docker). App runs locally with docker-compose.

**Goal:** Deploy full stack to EC2 using docker compose with production environment configuration.

---

## Definition of done

- `docker-compose.prod.yml` created.
- Services running on EC2:
  - api
  - worker
  - postgres
  - redis
  - prometheus
  - grafana
- Prisma migrations applied.
- API reachable via EC2 public IP.
- Worker connects to DB and queue.
- `docs/deploy/prod-compose.md` created.

---

## 1. Create production compose file

Include:
- Postgres with persistent volume
- Redis
- API
- Worker
- Prometheus (scraping /metrics)
- Grafana

---

## 2. Environment configuration

On EC2:
- Create `/opt/calsync/.env.production`
- Include:
  - DATABASE_URL
  - REDIS_URL
  - JWT_SECRET
  - ENCRYPTION_KEY
  - S3 + SQS configuration

Never commit this file.

---

## 3. Deploy stack

- Clone repo or copy files.
- Run:
  - `docker compose -f docker-compose.prod.yml up -d --build`
- Apply migrations:
  - `npx prisma migrate deploy`
- Verify containers running.

---

## 4. Smoke tests

- GET /health
- Login works
- Worker logs show polling

---

## Summary checklist

| Item | Action |
|------|--------|
| Compose file | Created and configured |
| Secrets | Server-only .env.production |
| Services running | All containers healthy |
| DB migrated | Migrations applied |
| Health check | API reachable |

---

## Suggested order of implementation

1. Create prod compose.
2. Configure env.
3. Deploy containers.
4. Apply migrations.
5. Test endpoints.

---