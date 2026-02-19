# Day 8 — Frontend auth + checkout flow

**Prerequisite:** Day 7 done (Stripe Checkout + order PAID). API has `POST /auth/login`, `GET /auth/me`, `/orgs`, `/events`, `/orders`, `POST /orders/:orderId/checkout`.

**Note:** For Stripe success/cancel redirects to hit the Next.js app, set `BASE_URL` in the API `.env` to the web app URL (e.g. `http://localhost:3000`).

**Goal:** Users can log in from the web app, have their token stored and sent with API calls, and (optionally) browse orgs/events, create an order, and redirect to Stripe Checkout. Protected routes show content only when authenticated.

---

## Definition of done

- **Login page:** Form (email + password) calls `POST /auth/login`, receives `accessToken` (and optionally `refreshToken`); store access token (e.g. memory, localStorage, or httpOnly cookie if you add cookie support later).
- **Auth context / hook:** App knows current user (from `GET /auth/me` using stored token); token attached to all API requests (e.g. `Authorization: Bearer <token>`).
- **Protected routes:** Routes that need auth (e.g. “My orders”, “Checkout”) redirect to login when there is no valid token (or show login prompt).
- **Optional:** Page that lists user’s orgs (call `GET /orgs`), then org’s events (`GET /orgs/:orgId/events` or public events endpoint if you have one).
- **Optional:** For a published event: create order (`POST /events/:eventId/orders`), then call `POST /orders/:orderId/checkout` and redirect user to the returned `url` (Stripe Checkout). After payment, user returns to success URL (e.g. `/orders/success?orderId=...`).

---

## 1. Auth storage and API client

- **Where to store token:** Simplest is `localStorage` or React state + in-memory; for refresh flow you can store `refreshToken` in `localStorage` and keep `accessToken` in memory.
- **API base URL:** Configure base URL for the backend (e.g. `NEXT_PUBLIC_API_URL=http://localhost:4000`). Use it in a small API client or `fetch` wrapper.
- **Attach token:** For every request that needs auth, set header `Authorization: Bearer <accessToken>`. If you get 401, clear token and redirect to login (and optionally try refresh if you have refresh tokens).

---

## 2. Login flow

- **Page:** e.g. `/login` with email + password form.
- **On submit:** `POST /auth/login` with `{ email, password }`. On success: save `accessToken` (and optionally `refreshToken`), then redirect to home or “My orders”.
- **On error:** Show validation or “Invalid credentials” message.

---

## 3. Current user (GET /auth/me)

- **On app load (or when token exists):** Call `GET /auth/me` with `Authorization: Bearer <token>`. If 200, store user (e.g. `id`, `email`) in context/state; if 401, clear token and treat as logged out.
- **Auth context:** Provide `user`, `isLoading`, `login`, `logout` so any component can know if user is logged in and trigger login/logout.

---

## 4. Protected routes

- **Option A:** Wrapper component that checks `user`; if null and not on login page, redirect to `/login`.
- **Option B:** Middleware (Next.js) or route guards that redirect unauthenticated users to `/login` for routes like `/orders`, `/checkout`, etc.
- Only allow access to “My orders” and “Checkout” when authenticated.

---

## 5. Optional: Orgs and events

- **My orgs:** Page or section that calls `GET /orgs` (with auth). Display list of orgs.
- **Org events:** For selected org, call `GET /orgs/:orgId/events` (or your public events endpoint) and list events. Use existing API structure.

---

## 6. Optional: Create order and redirect to Stripe

- **Event page:** For a published event, show “Buy tickets” and a simple form (e.g. ticket types + quantities). On submit: `POST /events/:eventId/orders` with body `{ items: [{ ticketTypeId, qty }, ...] }` (and optional `idempotencyKey`). Use auth header.
- **Checkout redirect:** On order created, call `POST /orders/:orderId/checkout` (with auth). Response is `{ url }`. Redirect: `window.location.href = url` (user goes to Stripe Checkout).
- **Success/cancel:** Stripe redirects back to your `success_url` / `cancel_url` (from Day 7). You can add simple pages `/orders/success` and `/orders/cancel` that read `orderId` from query and show a message; optionally call `GET /orders/:orderId` to show order status (PAID after webhook).

---

## 7. Security and UX

- **Token:** Don’t expose API secrets in the frontend; only the access (and optionally refresh) token is stored. Use HTTPS in production.
- **Logout:** Call `POST /auth/logout` with `refreshToken` if you use refresh flow; clear stored tokens and redirect to login.

---

## Summary checklist

| Item | Action |
|------|--------|
| API client | Base URL + attach `Authorization: Bearer <token>`; handle 401 (clear token, redirect to login). |
| Auth context | Store user from `/auth/me`; provide login, logout, user, isLoading. |
| Login page | Form → POST /auth/login → store token(s) → redirect. |
| Protected routes | Redirect to login when no valid user. |
| Optional: Orgs/events | GET /orgs, GET /orgs/:orgId/events with auth. |
| Optional: Checkout flow | POST /events/:eventId/orders → POST /orders/:orderId/checkout → redirect to `url`. |
| Success/cancel pages | Simple pages for Stripe return URLs. |

---

## Suggested order of implementation

1. API client + env `NEXT_PUBLIC_API_URL`.
2. Auth context: login (store token), logout (clear token), fetch `/auth/me` when token exists.
3. Login page and redirect after login.
4. Protected route wrapper and “My orders” page (GET orders list).
5. (Optional) Orgs list and org events.
6. (Optional) Event → create order → checkout redirect and success/cancel pages.
