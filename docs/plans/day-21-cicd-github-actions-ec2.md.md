# Day 21 — CI/CD (GitHub Actions → GHCR → EC2 docker compose)

**Prerequisite:** Day 18 complete (EC2 running stack).

**Goal:** Automate build, publish, and deploy pipeline without EKS or Terraform.

---

## Definition of done

- GitHub Actions workflow:
  - Lint
  - Test
  - Build api/web/worker images
  - Push to GHCR
  - SSH into EC2
  - `docker compose pull`
  - `docker compose up -d`
- Rollback documented.

---

## 1. Docker readiness

Ensure Dockerfiles exist for:
- apps/api
- apps/worker
- apps/web

---

## 2. GitHub secrets

Add:
- EC2_HOST
- EC2_USER
- EC2_SSH_KEY
- GHCR token (if needed)

---

## 3. Workflow

Create `.github/workflows/deploy.yml`:
- PR → lint + test
- main → lint + test + build + push + deploy

---

## Summary checklist

| Item | Action |
|------|--------|
| CI works | PR checks pass |
| Images pushed | GHCR updated |
| Auto deploy | main push updates EC2 |
| Rollback | Documented |

---

## Suggested order of implementation

1. Verify images build locally.
2. Add GHCR push workflow.
3. Add SSH deploy step.
4. Test end-to-end.

---