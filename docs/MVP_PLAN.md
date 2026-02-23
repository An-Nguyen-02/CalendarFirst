# CalSync Events — MVP plan and day register

## Project context (paste into a new chat)

**Project:** CalSync Events — calendar-first event management and ticketing platform.

**Goal (MVP, ~6 weeks):** Ship an MVP demonstrating: Node.js + Express + TypeScript (strict), Postgres (Docker → AWS RDS), Redis (Docker → ElastiCache), S3 + CloudFront, SQS + worker (calendar sync + email), Terraform, GitHub Actions CI/CD, EKS + Helm, observability (structured logs, Prometheus, Grafana).

**Stack (fixed):** npm workspaces; Backend: Express + TypeScript; ORM: Prisma; Validation: Zod; Frontend: Next.js; Async: SQS + worker; Cache: Redis; Cloud: AWS; Infra: Terraform + Helm; CI/CD: GitHub Actions.

**Repo layout:** `apps/web` (Next.js), `apps/api` (Express), `apps/worker` (SQS worker stub), `packages/shared`, `docs/`, `infra/` (planned).

**MVP features:** Auth + RBAC; Organizer event CRUD + publish; Ticketing + Stripe checkout (test); Google OAuth + calendar sync (planned); S3 presigned + CloudFront; Worker jobs via SQS; Deploy to EKS; Observability: /metrics, Grafana, alerts.

**Milestones (6 weeks):** Week 1 Foundation, Week 2 Events + public browsing, Week 3 Ticketing + Stripe, Week 4 Calendar integration, Week 5 AWS Terraform, Week 6 K8s + CI/CD + Observability.

**Current progress and next steps:** See the Day register below. Per-day plans are in `docs/plans/day-N-*.md`.

---

## Day register

| Day | Focus | Status | Plan file |
|-----|--------|--------|-----------|
| 1 | Monorepo + local infra + API boot + pino + request-id + Next health | Done | — |
| 2 | Prisma + migrations + seed | Done | — |
| 3 | Auth (JWT access + refresh, login/refresh/logout/me, Zod, requireAuth) | Done | — |
| 4 | RBAC + org membership | Done | — |
| 5 | Events CRUD + publish + public list | Done | — |
| 6 | Ticket model + transactional inventory + idempotent order create | Done | — |
| 7 | Stripe Checkout + order PAID + webhook | Done | [day-7-stripe-checkout.md](plans/day-7-stripe-checkout.md) |
| 8 | Frontend auth + checkout flow | Done | [day-8-frontend-auth-and-checkout.md](plans/day-8-frontend-auth-and-checkout.md) |
| 9 | Organizer flow (create org, event, ticket types; role-based nav) | Done | — |
| 10 | Organizer event orders + attendee order detail + cancel order | Done | [day-10-organizer-orders-and-attendee-order-detail.md](plans/day-10-organizer-orders-and-attendee-order-detail.md) |
| 11 | Event discovery (search/filters) + organizer delete event/ticket type | Done | [day-11-event-discovery-and-organizer-delete.md](plans/day-11-event-discovery-and-organizer-delete.md) |
| 12 | Order confirmation email (Resend, on order PAID) | Done | [day-12-email-notifications.md](plans/day-12-email-notifications.md) |
| 13+ | (Next) | Pending | — |

---

## How to ask for “create plan for next day”

1. Open this file and read the **Day register** to get the last completed day and the next day number.
2. Open the **last 1–2 day plan files** in `docs/plans/` to match prerequisites and style.
3. Create **docs/plans/day-N-&lt;short-name&gt;.md** with: title, Prerequisite, Goal, Definition of done, numbered sections, Summary checklist, Suggested order of implementation.
4. Update the Day register above: add the new day row as “Pending” with the plan file path; keep “Next” pointing at that day.

---

## Implementation prompt (for “implement day N”)

Use this in any chat to implement a specific day (replace N and the filename):

```
This is the CalSync Events project. Context and day register: see docs/MVP_PLAN.md.

Please implement Day N. Read the plan in docs/plans/day-N-<short-name>.md and complete everything in "Definition of done" following the "Suggested order of implementation." Use existing patterns in apps/api and apps/web. Do not add scope beyond the plan; treat "optional" items as optional. When finished, update the plan status for Day N in docs/MVP_PLAN.md (mark Done).
```

Example for Day 13:

```
This is the CalSync Events project. Context and day register: see docs/MVP_PLAN.md.

Please implement Day 13. Read the plan in docs/plans/day-13-<name>.md and complete everything in "Definition of done" following the "Suggested order of implementation." Use existing patterns in apps/api and apps/web. Do not add scope beyond the plan; treat "optional" items as optional. When finished, update the plan status for Day 13 in docs/MVP_PLAN.md (mark Done).
```
