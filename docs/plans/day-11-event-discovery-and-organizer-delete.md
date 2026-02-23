# Day 11 — Event discovery (search & filters) + Organizer delete (event & ticket type)

**Prerequisite:** Days 7–10 done. Public GET /events supports `from`, `to`, `limit`. API has DELETE event and DELETE ticket type; frontend does not yet call them.

**Goal:** Attendees can search and filter the public events list. Organizers can delete an event or a ticket type from the UI (with confirmation). Optional: paginate events list.

---

## Definition of done

- **API:** GET /events accepts optional `q` (search in title/description) and continues to support `from`, `to`, `limit` (and optionally `offset` for pagination).
- **Frontend (events list):** Search input and optional date-range or “upcoming” filter; pass query params to API. Optional: “Load more” or simple pagination.
- **Frontend (organizer):** “Delete event” on event detail (with confirm dialog); “Delete ticket type” per row with confirm. Call existing DELETE APIs; redirect or refresh list after delete.
- **Safety:** Confirm before delete; only allow delete when sensible (e.g. no paid orders for event, or document behavior if orders exist).

---

## 1. API: Search and filter for public events

- **Existing:** GET /events already supports `from`, `to`, `limit` (see eventController.listPublicEvents and eventService.listPublic).
- **Add:** Optional query `q` (string). When present, filter events where `title` or `description` contains the string (case-insensitive). Use Prisma `contains` with mode `insensitive`, or raw `ILIKE` if needed.
- **Optional:** Add `offset` for skip-based pagination; return `{ events, total }` or keep current shape and document `limit`/`offset` in the plan.
- **Service:** Extend `eventService.listPublic` to accept `search?: string` and optionally `offset`; build `where` with `AND` of status PUBLISHED, date range, and search on title/description.

---

## 2. Frontend: Events list search and filters

- **Page:** Public events list (e.g. `/events`).
- **Search:** Text input that sets a `q` (or `search`) query param; on submit or debounced input, refetch GET /events?q=... (and keep from/to/limit if used).
- **Filters (optional):** “Upcoming only” (set `from` to now) or date range inputs; pass `from`/`to` to API.
- **URL:** Keep search and key filters in URL (e.g. `?q=concert&from=...`) so the list is shareable and back-button friendly.
- **Pagination (optional):** “Load more” using `limit` + `offset`, or a simple page size and page number.

---

## 3. Frontend: Organizer – Delete event

- **Placement:** On organizer event detail page (`/orgs/[orgId]/events/[eventId]`), add a “Delete event” button (e.g. at bottom or in a menu).
- **Flow:** On click, show confirmation dialog (“Are you sure? This cannot be undone.” or “This will delete the event and its ticket types. Orders will remain but reference a deleted event.”). On confirm, call DELETE `/orgs/:orgId/events/:eventId`; on success redirect to `/orgs/[orgId]/events`. On 4xx (e.g. “cannot delete: has paid orders”), show error message.
- **API:** Existing DELETE event already exists; document or enforce rules (e.g. allow delete only when no orders, or allow and handle soft-delete later).

---

## 4. Frontend: Organizer – Delete ticket type

- **Placement:** In the “Ticket types” section of organizer event detail, add a “Delete” (or trash icon) per ticket type row.
- **Flow:** Confirm (“Remove this ticket type? It cannot be undone.”). On confirm, call DELETE `/orgs/:orgId/events/:eventId/ticket-types/:ticketTypeId`. On success remove from local state or refetch ticket types. If API returns 400 (e.g. already sold), show error.
- **API:** Existing DELETE ticket type exists; ensure it rejects or allows when quantitySold > 0 (document or implement: e.g. block delete if any sold).

---

## 5. API: Delete rules (document or implement)

- **Event:** Decide: allow delete only when event has no orders, or allow always (orders keep eventId; event row removed). If “no orders”: in eventService.deleteEvent, check order count and return error if > 0.
- **Ticket type:** Decide: allow delete only when quantitySold === 0, or allow always. If “no sold”: in ticketTypeService.deleteTicketType, check quantitySold and return 400 if > 0.
- Document the chosen behavior in the plan or code comments.

---

## 6. Summary checklist

| Item | Action |
|------|--------|
| API search | GET /events?q=... filters by title/description (case-insensitive). |
| API pagination (optional) | Add offset and/or total count to list response. |
| Events list UI | Search input + optional from/to; pass params to API; optional Load more. |
| Delete event UI | Button + confirm dialog; DELETE event; redirect to org events. |
| Delete ticket type UI | Delete per row + confirm; DELETE ticket-type; refresh list. |
| Delete rules | Document or enforce: no orders for event delete; no sold for ticket type delete. |

---

## Suggested order of implementation

1. **API:** Add `q` (search) to eventService.listPublic and listPublicEvents controller; add optional `offset` if doing pagination.
2. **API (optional):** Enforce delete rules (event: no orders; ticket type: quantitySold === 0) and return clear 400 messages.
3. **Frontend:** Events list – search input and URL params; optional date filters; optional Load more.
4. **Frontend:** Organizer event detail – Delete event button + confirm; call DELETE; redirect.
5. **Frontend:** Organizer event detail – Delete ticket type per row + confirm; call DELETE; refresh list.
