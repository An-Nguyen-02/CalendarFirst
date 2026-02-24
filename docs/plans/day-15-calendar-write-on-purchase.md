# Day 15 — “Add to Google Calendar” write on order paid (API + worker job)

## Prerequisites
- Day 14 complete (worker can call Google and store snapshots).
- Stripe webhook → order PAID pipeline exists (Day 7).

## Goal
When an order becomes PAID, the system can create a Google Calendar event for the purchased event (write).

## Definition of done
- On order PAID (webhook handler or post-payment pipeline), enqueue job: `google_calendar_create_event`.
- Worker creates calendar event in Google Calendar and persists mapping in DB.
- Job is idempotent (cannot create duplicates for same order/user).
- Organizer/attendee can see “added to calendar” status.

## Implementation plan

### 1) Data model
Add `CalendarWrite` (or `AddedToCalendar`):
- `id`, `userId`, `orderId`, `provider`, `providerCalendarEventId`, `createdAt`
- `@@unique([userId, orderId, provider])` for idempotency

Migration:
- `calendar_write_on_purchase`

### 2) Enqueue job on PAID
Wherever you mark order as PAID:
- After transaction commits, enqueue:
  - `{ type: "google_calendar_create_event", userId, orderId }`

### 3) Worker create event
- Fetch order + event details (title, start/end, venue, description)
- Check if `CalendarWrite` exists for `(userId, orderId, GOOGLE)` → if yes, exit success
- Exchange refresh for access token
- Call Google Calendar “events.insert”
- Store provider event id in `CalendarWrite`
- (Optional) store event link in raw JSON

### 4) API read status
Add:
- `GET /orders/:orderId/calendar-status`
  - Auth required
  - Returns `{ google: { added: boolean, providerEventId?: string } }`

### 5) Frontend UX (minimal)
On order detail page:
- Show “Added to Google Calendar” if status exists
- If not added and user has no Google connection, show “Connect Google to add to calendar”

## Suggested order of implementation
1. Prisma migration for CalendarWrite
2. Enqueue in order PAID flow
3. Worker `events.insert` + idempotency
4. Status endpoint
5. UI display

## Summary checklist
- [ ] Job enqueued on PAID
- [ ] Worker creates Google calendar event once
- [ ] Mapping stored and used as idempotency key
- [ ] Status visible in UI