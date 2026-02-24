# Day 17 — AWS Free Tier foundation: EC2 host + budget guardrails

**Prerequisite:** Days 13–16 done (Google OAuth + calendar sync jobs exist, queue abstraction in place or LocalStack locally). App runs locally via docker-compose.

**Goal:** Create a single EC2 Free Tier host that can run the full stack and set strict cost guardrails to prevent accidental spend.

---

## Definition of done

- **AWS:** One EC2 Free Tier instance created (t2.micro or t3.micro, Linux).
- **Networking:** Security Group configured:
  - 22/SSH restricted to your IP
  - 80/HTTP open
- **Cost guardrails:** AWS Budget alert configured (e.g., €3 warning, €5 hard alert).
- **Host:** Docker + Docker Compose installed; `/opt/calsync` created.
- **Docs:** `docs/deploy/ec2-setup.md` created with exact setup steps.

---

## 1. AWS: Create EC2 (Free Tier) + security group

- Instance: t2.micro or t3.micro (Free Tier eligible), Ubuntu or Amazon Linux.
- Disk: Keep EBS <= 30GB.
- Security Group:
  - Inbound: 22 from your IP only, 80 from 0.0.0.0/0.
  - Outbound: allow all (default).
- Create and download keypair securely.

---

## 2. AWS: Create Budget alerts

- Monthly budget:
  - Alert at €3
  - Alert at €5
- Email notification enabled.

---

## 3. EC2: Install Docker + Docker Compose

- Install Docker Engine.
- Install Docker Compose plugin.
- Add user to docker group.
- Verify:
  - `docker run hello-world`
  - `docker compose version`

---

## 4. Documentation

Create `docs/deploy/ec2-setup.md` documenting:
- AMI used
- Instance type
- Security group rules
- Install commands
- Env file location

---

## Summary checklist

| Item | Action |
|------|--------|
| EC2 created | t2.micro/t3.micro, minimal EBS |
| SG locked | SSH restricted, HTTP open |
| Budget alerts | €3 + €5 alerts |
| Docker ready | Installed and verified |
| Docs written | ec2-setup.md created |

---

## Suggested order of implementation

1. Create Budget alerts.
2. Launch EC2 + SG.
3. Install Docker + Compose.
4. Write setup documentation.

---