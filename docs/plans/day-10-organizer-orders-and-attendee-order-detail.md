# Day 10 — Organizer: event orders & edit; Attendee: order detail

**Prerequisite:** Days 7–9 done (Stripe checkout, frontend auth, organizer create org/event/ticket types). API has PATCH/DELETE event, GET/PATCH/DELETE ticket types; no “event orders” endpoint or order-detail UI.

**Goal:** Organizers can edit an event and see orders/sales for that event. Attendees get an order detail page (line items, status, link to checkout if unpaid). Optional: allow cancelling an order that is still CREATED.

---

## Definition of done

- **API:** GET orders for an event (organizer only, scoped to org).
- **API (optional):** POST /orders/:orderId/cancel for CREATED orders (owner only).
- **Frontend (organizer):** Edit event page (PATCH event); event detail shows “Orders” / “Sales” with list of orders for that event.
- **Frontend (attendee):** Order detail page at `/orders/[orderId]` with line items, total, status; if status CREATED, show “Pay now” → checkout.
- **UX:** Loading and error states; only show edit/orders to org members; only show order detail to the order owner.

---

## 1. API: List orders for an event (organizer)

- **Route:** e.g. **GET /orgs/:orgId/events/:eventId/orders** (require auth + org membership).
- **Handler:** Load event by `eventId` and `orgId`; if not found or user not in org, 404/403. Return orders for that event (include `items` with ticket type name/price, `user` email or id if useful). Order by `createdAt` desc.
- **Response:** `{ orders: [{ id, status, totalCents, createdAt, items: [...] }, ...] }`.

---

## 2. API (optional): Cancel order

- **Route:** **POST /orders/:orderId/cancel** (require auth; order must belong to `req.user`).
- **Handler:** Load order; if status !== CREATED, return 400. Set status to CANCELLED; return updated order.
- **Frontend:** On order detail, if status is CREATED, show “Cancel order” button that calls this and then refreshes or redirects to orders list.

---

## 3. Frontend: Organizer – Edit event

- **Page:** e.g. `/orgs/[orgId]/events/[eventId]/edit` (reuse form fields from “new event”: title, description, startAt, endAt, venue, status).
- **Load:** GET `/orgs/:orgId/events/:eventId` to prefill form.
- **Submit:** PATCH `/orgs/:orgId/events/:eventId` with form data; on success redirect to event detail or org events list.
- **Link:** From organizer event detail page, add “Edit event” that goes to this page. Guard route so only org members see it.

---

## 4. Frontend: Organizer – Event orders / sales

- **Placement:** On organizer event detail page (`/orgs/[orgId]/events/[eventId]`), add a section “Orders” or “Sales”.
- **Data:** GET `/orgs/:orgId/events/:eventId/orders` (when viewing as organizer). Show table or list: order id, buyer (if returned), status, total, date; optionally expand to show line items.
- **Empty state:** “No orders yet” when list is empty.

---

## 5. Frontend: Attendee – Order detail page

- **Page:** `/orders/[orderId]` (protected; only order owner can view).
- **Data:** GET `/orders/:orderId` (already exists; ensure response includes `items` with ticket type name, qty, unit price, and `event` or event title for context).
- **UI:** Show order status (CREATED / PAID / CANCELLED), event name, line items (name, qty, price), total. If CREATED: “Pay now” button → redirect to existing checkout flow (`/orders/[orderId]/checkout`). If PAID: “Paid” badge; optional “View event” link.
- **Link:** From “My orders” list, make each order row link to `/orders/[orderId]`.

---

## 6. API: Order detail response shape

- Ensure **GET /orders/:orderId** returns enough for the order detail page: `order` with `id`, `status`, `totalCents`, `createdAt`, `event` (id, title, startAt), `items` (ticketTypeId, ticket type name, qty, unitPriceCents). Add ticket type name (and event) in service/controller if not already present.

---

## 7. Security and validation

- Event orders: only org members (or at least organizers) can list orders for an event.
- Order detail: only the order owner can GET their order (already enforced if GET /orders/:orderId checks `userId`).
- Cancel: only order owner; only CREATED orders.

---

## Summary checklist

| Item | Action |
|------|--------|
| GET event orders | GET /orgs/:orgId/events/:eventId/orders, auth + org membership; return orders + items. |
| Optional: cancel order | POST /orders/:orderId/cancel, owner only, status CREATED → CANCELLED. |
| Order response | GET /orders/:orderId includes event + items with ticket type names. |
| Edit event page | Form PATCH event; link from organizer event detail. |
| Event orders section | Organizer event detail: list orders for event. |
| Order detail page | /orders/[orderId]: status, items, total; “Pay now” if CREATED; link from My orders. |

---

## Suggested order of implementation

1. **API:** GET /orgs/:orgId/events/:eventId/orders (service + controller + route with org middleware).
2. **API:** Enrich GET /orders/:orderId with event and item ticket-type names if missing.
3. **API (optional):** POST /orders/:orderId/cancel.
4. **Frontend:** Order detail page at /orders/[orderId]; link from My orders.
5. **Frontend:** Edit event page; link from organizer event detail.
6. **Frontend:** Event orders section on organizer event detail.
