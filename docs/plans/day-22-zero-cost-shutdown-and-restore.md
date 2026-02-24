# Day 22 — Zero-cost shutdown + restore strategy

**Prerequisite:** Day 21 complete (CI/CD operational).

**Goal:** Ensure application can be fully shut down to €0 monthly cost and restored easily.

---

## Definition of done

### Backup
- Script `backup.sh`:
  - pg_dump database
  - upload to S3 backups bucket
- Backup bucket under 5GB (Free Tier)

### Shutdown
- Terminate EC2 instance
- Delete EBS volume
- Release Elastic IP
- Confirm AWS cost forecast is $0

### Restore
- Launch new EC2
- Run docker compose
- Download backup from S3
- Restore DB via psql
- App returns to previous state

---

## backup.sh example

pg_dump -U postgres -d calsync > backup.sql  
aws s3 cp backup.sql s3://calsync-backups/

---

## restore.sh example

aws s3 cp s3://calsync-backups/backup.sql .  
psql -U postgres -d calsync < backup.sql

---

## Summary checklist

| Item | Action |
|------|--------|
| DB backup verified | Dump + restore tested |
| EC2 terminated | No compute running |
| EBS deleted | No storage billed |
| Monthly cost €0 | Billing dashboard verified |
| Restore tested | Full stack recovered |

---

## Suggested order of implementation

1. Create and test backup.sh.
2. Upload backup to S3.
3. Terminate EC2 + delete EBS.
4. Recreate EC2 and restore DB.
5. Verify application works.

---