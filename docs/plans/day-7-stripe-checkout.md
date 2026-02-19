# Day 7 — Stripe Checkout (test mode) + order PAID

**Setup (run before first use):**
- In `apps/api`: `npm install` (installs `stripe`), then `npx prisma migrate dev` (applies Payment migration and regenerates Prisma client).
- Add to `.env`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and optionally `BASE_URL` (e.g. `http://localhost:4000`).

**Goal:** After a buyer creates an order (status CREATED), they can start a Stripe Checkout session (test mode). On successful payment, the API marks the order as PAID (and optionally records a payment record). No frontend UI required for Day 7; call the API from curl/Postman or a simple test.

## Definition of done

- **POST /orders/:orderId/checkout** (or similar) creates a Stripe Checkout Session for that order and returns `{ url }` to redirect the client.
- **Stripe webhook endpoint** receives `checkout.session.completed` (or equivalent), verifies signature, finds the order, sets status to PAID, and returns 200.
- Orders in **CREATED** can go to checkout; orders already **PAID** or **CANCELLED** are rejected or return a clear error.

---

## 1. Config and dependencies

- **Env:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY` (optional for API; needed for frontend later). Use test keys (e.g. `sk_test_...`, `whsec_...`).
- **Package:** `stripe` in `apps/api`.
- **Docs:** [Stripe Checkout](https://stripe.com/docs/checkout), [Webhooks](https://stripe.com/docs/webhooks).

---

## 2. Optional: Payment model (recommended)

- **Prisma:** Add `Payment` with `id`, `orderId`, `provider` (e.g. `"stripe"`), `providerRef` (Stripe payment_intent or session id), `status`, `createdAt`. One order can have multiple payments (e.g. failed then succeeded); for Day 7 you can keep it to one successful payment per order.
- Lets you support refunds, disputes, and reporting later.

---

## 3. Checkout session (create session for an order)

- **Route:** e.g. **POST /orders/:orderId/checkout** (auth required; order must belong to `req.user.sub`).
- **Handler:**
  - Load order by id and userId; if not found or status not CREATED, return 404/400.
  - Build Stripe line items from `order.items` (e.g. ticket type name, qty, unit_price_cents in smallest currency unit).
  - Create Stripe Checkout Session (mode: payment), with `success_url` and `cancel_url` (e.g. query param orderId for success).
  - Store `metadata.orderId` (and optionally `metadata.userId`) on the session so the webhook can find the order.
  - Return `{ url: session.url }` (client redirects to Stripe).
- **Idempotency:** Optional: same Idempotency-Key semantics as order create if you want to avoid duplicate sessions for the same "attempt".

---

## 4. Webhook endpoint (mark order PAID)

- **Route:** **POST /webhooks/stripe** (no auth; Stripe signs the body).
- **Handler:**
  - Read **raw body** (required for signature verification; ensure Express doesn't parse JSON for this route, or use a dedicated raw-body middleware for `/webhooks/stripe`).
  - Verify `Stripe-Signature` with `STRIPE_WEBHOOK_SECRET` and `stripe.webhooks.constructEvent`.
  - On `checkout.session.completed`: read `metadata.orderId`, load order, if status is still CREATED then update to PAID (and optionally create a Payment row).
  - Return 200 quickly; do not do heavy work in the webhook (queue if needed later).
- **Local testing:** Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks: `stripe listen --forward-to localhost:4000/webhooks/stripe`.

---

## 5. Order status rules

- Only orders in **CREATED** can start checkout.
- Webhook only moves **CREATED → PAID**.
- Optionally: later add **CANCELLED** (e.g. user cancels or session expires); Day 7 can leave that as-is.

---

## 6. Security and validation

- **Checkout:** ensure order belongs to the authenticated user.
- **Webhook:** always verify signature; ignore unknown event types.
- Do not expose Stripe secret key to the client; only the API creates sessions and handles webhooks.

---

## 7. Verification

1. Create an order (Day 6 flow).
2. Call **POST /orders/:orderId/checkout** with Bearer token; get back a Stripe URL; open in browser and pay with test card (e.g. `4242 4242 4242 4242`).
3. Trigger webhook (Stripe CLI or Stripe Dashboard test webhook); confirm order status becomes PAID.
4. Call **GET /orders/:orderId** and see `status: "PAID"`.

---

## Summary checklist

| Item | Action |
|------|--------|
| Env + Stripe SDK | Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET; install stripe in api. |
| Payment model (optional) | Add Payment in Prisma; migration. |
| Checkout route | POST /orders/:orderId/checkout (requireAuth, load order, create session, return url). |
| Webhook route | POST /webhooks/stripe (raw body, verify signature, on checkout.session.completed set order PAID). |
| App wiring | Mount webhook with raw body; mount checkout under orders. |

---

**Alternative focus for Day 7:** If you prefer to do frontend auth first (login, token storage, protected routes, call /auth/me and org/event APIs), the same structure applies: one day = one clear scope (either Stripe or frontend auth). Say which you want and the plan can be adjusted or a second "Day 7b" plan can be outlined.

If you want this turned into a formal plan file (e.g. in `.cursor/plans/` or similar), switch to Agent mode and ask to "create the Day 7 plan file from the plan above."
