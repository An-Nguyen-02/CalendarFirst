# Day 12 — Order confirmation email

**Setup (optional, for sending real email):** In `apps/api`, add to `.env`: `RESEND_API_KEY` (from [Resend](https://resend.com)), and optionally `FROM_EMAIL` (default `onboarding@resend.dev`). If `RESEND_API_KEY` is not set, the webhook still succeeds and logs that email was skipped.

**Prerequisite:** Days 7–11 done (Stripe webhook marks order PAID). API has order, user (email), event.

**Goal:** When an order is marked PAID (after Stripe checkout), send one transactional email to the order owner with event name, order summary, and total. Email is best-effort (webhook must not fail if send fails).

---

## Definition of done

- **API:** After processing `checkout.session.completed`, if order was marked PAID, send an "Order confirmed" email to the order owner's email address. Email includes: event title, order total, and a short message (e.g. "Your tickets" / "See you there").
- **Config:** Use an env var for the email provider (e.g. `RESEND_API_KEY`). If not set, log that email would have been sent (dev-friendly); do not fail the webhook.
- **Implementation:** One email service module; call it from the Stripe webhook handler after `markOrderPaid` + `createPayment`. Load order with user and event for the email content.

---

## 1. Email provider and env

- **Choice:** Resend (simple API, free tier) or nodemailer (SMTP / Ethereal for testing). Plan assumes Resend; use `RESEND_API_KEY` and optional `FROM_EMAIL` (e.g. `onboarding@resend.dev` for testing).
- **Fallback:** If `RESEND_API_KEY` is missing, log payload and return without sending so local dev works without keys.

---

## 2. Email service

- **Module:** e.g. `apps/api/src/services/emailService.ts`.
- **Function:** `sendOrderConfirmation(orderId: string): Promise<void>`. Load order by id with `user` and `event` and `items` (ticket types). Build plain-text or HTML body: event title, list of items (name × qty), total. Send to `order.user.email`. Subject: e.g. "Order confirmed: {event.title}".
- **Resend:** Use `resend.emails.send({ from, to, subject, html })`. Catch errors and log; do not throw (best-effort).

---

## 3. Webhook integration

- In `stripeWebhookController.handleStripeWebhook`, after `markOrderPaid` and `createPayment`, call `emailService.sendOrderConfirmation(orderId)`. Do not await in a way that fails the webhook response; fire-and-forget with `.catch(err => log(err))` or await inside try/catch and ignore errors.

---

## 4. Summary checklist

| Item | Action |
|------|--------|
| Env | `RESEND_API_KEY`, optional `FROM_EMAIL`. |
| emailService | Load order (user, event, items); send one email via Resend; no throw. |
| Webhook | After PAID + payment record, call sendOrderConfirmation; log and ignore send errors. |

---

## Suggested order of implementation

1. Add `resend` dependency to `apps/api`; add env vars to `.env.example` (or docs).
2. Implement `emailService.sendOrderConfirmation(orderId)` with fallback when no API key.
3. In Stripe webhook handler, after marking order PAID and creating payment, call `sendOrderConfirmation(orderId)` and catch/log any error.
4. Verify: run webhook (Stripe CLI or test), confirm order PAID and email sent (or logged when key missing).
