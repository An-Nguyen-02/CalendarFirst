# Day 19 — S3 + SQS + IAM (Free Tier safe)

**Prerequisite:** Day 18 complete (app running on EC2).

**Goal:** Use AWS S3 and SQS securely within Free Tier using IAM role (no static credentials).

---

## Definition of done

- S3 bucket created (private, block public access).
- SQS main queue + DLQ created.
- IAM role created and attached to EC2 with minimal permissions:
  - s3:GetObject
  - s3:PutObject
  - sqs:SendMessage
  - sqs:ReceiveMessage
  - sqs:DeleteMessage
- API and Worker use instance role (no AWS keys in env).

---

## 1. Create S3 bucket

- Private bucket.
- Block all public access.
- Used for:
  - Uploads
  - Database backups

---

## 2. Create SQS queue + DLQ

- Main queue.
- Dead-letter queue.
- Configure redrive policy.

---

## 3. Create IAM role

- EC2 instance profile.
- Attach minimal policy for S3 + SQS.
- Attach role to instance.
- Remove AWS keys from environment.

---

## Summary checklist

| Item | Action |
|------|--------|
| S3 bucket | Private and working |
| SQS queue | Main + DLQ created |
| IAM role | Attached to EC2 |
| No static creds | Confirmed |

---

## Suggested order of implementation

1. Create S3.
2. Create SQS.
3. Create IAM role.
4. Attach to EC2.
5. Test S3 + SQS integration.

---