# Day 20 — Observability on EC2 (no CloudWatch cost)

**Prerequisite:** Day 18 complete (stack running).

**Goal:** Run Prometheus + Grafana locally on EC2 and monitor API + worker without CloudWatch.

---

## Definition of done

- API exposes `/metrics`.
- Worker exposes `/metrics`.
- Prometheus scrapes both.
- Grafana dashboard created:
  - RPS
  - 5xx rate
  - p95 latency
  - worker failures
- No CloudWatch custom metrics used.

---

## 1. Configure Prometheus

- Add scrape targets:
  - api:4000/metrics
  - worker:port/metrics

---

## 2. Configure Grafana

- Connect to Prometheus datasource.
- Import/create dashboard panels.

---

## 3. Secure Grafana

- Basic auth or strong password.
- Do not expose admin/admin publicly.

---

## Summary checklist

| Item | Action |
|------|--------|
| Metrics exposed | API + Worker |
| Prometheus | Scraping targets |
| Grafana | Dashboard visible |
| No AWS metric cost | Confirmed |

---

## Suggested order of implementation

1. Add metrics endpoints.
2. Configure Prometheus.
3. Configure Grafana.
4. Verify metrics.

---