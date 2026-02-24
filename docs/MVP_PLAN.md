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
| 13 | Google OAuth connect (login + token storage) | Pending | [day-13-google-oauth-connect.md](plans/day-13-google-oauth-connect.md) |
| 14 | Calendar sync read: fetch Google events → store snapshot | Pending | [day-14-calendar-sync-read.md](plans/day-14-calendar-sync-read.md) |
| 15 | “Add to Google Calendar” write on order paid (API + worker job) | Pending | [day-15-calendar-write-on-purchase.md](plans/day-15-calendar-write-on-purchase.md) |
| 16 | SQS jobs for calendar sync + retries + DLQ (local + AWS-ready) | Pending | [day-16-sqs-calendar-jobs.md](plans/day-16-sqs-calendar-jobs.md) |
| 17 | Terraform foundations: remote state + VPC + networking baseline | Pending | [day-17-terraform-foundation.md](plans/day-17-terraform-foundation.md) |
| 18 | Terraform data: RDS Postgres + ElastiCache Redis + S3 + SQS | Pending | [day-18-terraform-data-and-queues.md](plans/day-18-terraform-data-and-queues.md) |
| 19 | EKS + ECR + IAM baseline (Terraform) | Pending | [day-19-terraform-eks-ecr-iam.md](plans/day-19-terraform-eks-ecr-iam.md) |
| 20 | Helm charts for api/web/worker + kube-prometheus-stack | Pending | [day-20-helm-and-observability.md](plans/day-20-helm-and-observability.md) |
| 21 | GitHub Actions CI/CD: build/test → push ECR → helm deploy | Pending | [day-21-cicd-github-actions.md](plans/day-21-cicd-github-actions.md) || 13 | Google OAuth connect (login + token storage) | Pending | [day-13-google-oauth-connect.md](plans/day-13-google-oauth-connect.md) |
| 14 | Calendar sync read: fetch Google events → store snapshot | Pending | [day-14-calendar-sync-read.md](plans/day-14-calendar-sync-read.md) |
| 15 | “Add to Google Calendar” write on order paid (API + worker job) | Pending | [day-15-calendar-write-on-purchase.md](plans/day-15-calendar-write-on-purchase.md) |
| 16 | SQS jobs for calendar sync + retries + DLQ (local + AWS-ready) | Pending | [day-16-sqs-calendar-jobs.md](plans/day-16-sqs-calendar-jobs.md) |
| 17 | AWS Free Tier foundation: EC2 host + budget guardrails | Pending | [day-17-ec2-free-tier-foundation.md](plans/day-17-ec2-free-tier-foundation.md) |
| 18 | Production docker-compose on EC2 (single-host deployment) | Pending | [day-18-single-host-stack-deploy.md](plans/day-18-single-host-stack-deploy.md) |
| 19 | S3 + SQS + IAM (Free Tier safe) | Pending | [day-19-s3-sqs-and-iam-free-tier.md](plans/day-19-s3-sqs-and-iam-free-tier.md) |
| 20 | Observability on EC2 (no CloudWatch cost) | Pending | [day-20-observability-on-ec2.md](plans/day-20-observability-on-ec2.md) |
| 21 | CI/CD (GitHub Actions → GHCR → EC2 docker compose) | Pending | [day-21-cicd-github-actions-ec2.md](plans/day-21-cicd-github-actions-ec2.md) |
| 22 | Zero-cost shutdown + restore strategy | Pending | [day-22-zero-cost-shutdown-and-restore.md](plans/day-22-zero-cost-shutdown-and-restore.md) |

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
