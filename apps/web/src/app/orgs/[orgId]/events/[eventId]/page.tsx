"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/contexts/AuthContext";
import { apiJson } from "@/lib/api";
import { formatCents, formatDate } from "@/lib/format";
import type { EventSummary, EventOrdersResponse, TicketTypesResponse } from "@/types/api";

function OrganizerEventContent() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const eventId = params.eventId as string;
  const { getToken } = useAuth();
  const [event, setEvent] = useState<EventSummary | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypesResponse["ticketTypes"]>([]);
  const [eventOrders, setEventOrders] = useState<EventOrdersResponse["orders"]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit event form state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartAt, setEditStartAt] = useState("");
  const [editEndAt, setEditEndAt] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editStatus, setEditStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [editCapacity, setEditCapacity] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // New ticket type form
  const [ttName, setTtName] = useState("");
  const [ttPriceCents, setTtPriceCents] = useState("");
  const [ttCurrency, setTtCurrency] = useState("USD");
  const [ttQuantityTotal, setTtQuantityTotal] = useState("");
  const [ttSubmitting, setTtSubmitting] = useState(false);
  const [ttError, setTtError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    Promise.all([
      apiJson<EventSummary>(`/orgs/${orgId}/events/${eventId}`, { token }),
      apiJson<TicketTypesResponse>(`/orgs/${orgId}/events/${eventId}/ticket-types`, { token }),
    ])
      .then(([ev, tt]) => {
        setEvent(ev);
        setTicketTypes(tt.ticketTypes);
        setEditTitle(ev.title);
        setEditDescription(ev.description ?? "");
        setEditStartAt(ev.startAt.slice(0, 16));
        setEditEndAt(ev.endAt.slice(0, 16));
        setEditVenue(ev.venue ?? "");
        setEditStatus(ev.status as "DRAFT" | "PUBLISHED");
        setEditCapacity(ev.capacity != null ? String(ev.capacity) : "");
      })
      .catch(() => setError("Event not found"))
      .finally(() => setLoading(false));
  }, [orgId, eventId, getToken]);

  useEffect(() => {
    const token = getToken();
    if (!token || !event) return;
    setOrdersLoading(true);
    apiJson<EventOrdersResponse>(`/orgs/${orgId}/events/${eventId}/orders`, { token })
      .then((data) => setEventOrders(data.orders))
      .catch(() => setEventOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [orgId, eventId, event, getToken]);

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    setEditSaving(true);
    const token = getToken();
    if (!token) {
      setEditSaving(false);
      return;
    }
    try {
      await apiJson(`/orgs/${orgId}/events/${eventId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          startAt: new Date(editStartAt).toISOString(),
          endAt: new Date(editEndAt).toISOString(),
          venue: editVenue || null,
          status: editStatus,
          capacity: editCapacity ? parseInt(editCapacity, 10) : null,
        }),
      });
      if (event) {
        setEvent({
          ...event,
          title: editTitle,
          description: editDescription || null,
          startAt: editStartAt,
          endAt: editEndAt,
          venue: editVenue || null,
          status: editStatus,
          capacity: editCapacity ? parseInt(editCapacity, 10) : null,
        });
      }
      setEditing(false);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { error?: string } }).data?.error ?? "Update failed")
          : "Update failed";
      setEditError(msg);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleAddTicketType(e: React.FormEvent) {
    e.preventDefault();
    setTtError("");
    const price = parseInt(ttPriceCents, 10);
    const qty = parseInt(ttQuantityTotal, 10);
    if (isNaN(price) || price < 0 || isNaN(qty) || qty < 1) {
      setTtError("Invalid price or quantity");
      return;
    }
    setTtSubmitting(true);
    const token = getToken();
    if (!token) {
      setTtSubmitting(false);
      return;
    }
    try {
      const created = await apiJson<{ id: string; name: string; priceCents: number; currency: string; quantityTotal: number; quantitySold: number }>(
        `/orgs/${orgId}/events/${eventId}/ticket-types`,
        {
          method: "POST",
          token,
          body: JSON.stringify({
            name: ttName,
            priceCents: price,
            currency: ttCurrency,
            quantityTotal: qty,
          }),
        }
      );
      setTicketTypes((prev) => [...prev, created]);
      setTtName("");
      setTtPriceCents("");
      setTtQuantityTotal("");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { error?: string } }).data?.error ?? "Failed to add ticket type")
          : "Failed to add ticket type";
      setTtError(msg);
    } finally {
      setTtSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }
  if (error || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || "Not found"}</p>
          <Link href={`/orgs/${orgId}/events`} className="mt-4 inline-block underline">
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href={`/orgs/${orgId}/events`} className="text-zinc-600 hover:underline dark:text-zinc-400">
            ← Events
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {event.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(event.startAt)} – {formatDate(event.endAt)}
            {event.venue && ` · ${event.venue}`}
          </p>
          <span className="mt-2 inline-block rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
            {event.status}
          </span>
          {event.description && (
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">{event.description}</p>
          )}
          {event.capacity != null && (
            <p className="mt-2 text-sm text-zinc-500">Capacity: {event.capacity}</p>
          )}

          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-4 text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
            >
              Edit event
            </button>
          ) : (
            <form onSubmit={handleEditSubmit} className="mt-6 space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-700">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Edit event</h2>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Start</label>
                  <input
                    type="datetime-local"
                    value={editStartAt}
                    onChange={(e) => setEditStartAt(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">End</label>
                  <input
                    type="datetime-local"
                    value={editEndAt}
                    onChange={(e) => setEditEndAt(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Venue</label>
                <input
                  type="text"
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Capacity</label>
                <input
                  type="number"
                  min={1}
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              {editError && <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {editSaving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Orders</h2>
          {ordersLoading ? (
            <p className="mt-2 text-sm text-zinc-500">Loading orders…</p>
          ) : eventOrders.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No orders yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {eventOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-100 py-2 px-3 dark:border-zinc-700"
                >
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {o.user?.email ?? "—"} · {formatCents(o.totalCents)}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      o.status === "PAID"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : o.status === "CREATED"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {o.status}
                  </span>
                  <span className="w-full text-xs text-zinc-500 dark:text-zinc-400">
                    {o.items.map((i) => `${i.qty}× ${i.ticketType.name}`).join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Ticket types</h2>
          {ticketTypes.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No ticket types yet. Add one below.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {ticketTypes.map((tt) => (
                <li key={tt.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-100 py-2 px-3 dark:border-zinc-700">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{tt.name}</span>
                  <span className="text-sm text-zinc-500">
                    {formatCents(tt.priceCents)} · {tt.quantitySold} / {tt.quantityTotal} sold
                  </span>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddTicketType} className="mt-6 space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Add ticket type</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400">Name</label>
                <input
                  type="text"
                  value={ttName}
                  onChange={(e) => setTtName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400">Price (cents)</label>
                <input
                  type="number"
                  min={0}
                  value={ttPriceCents}
                  onChange={(e) => setTtPriceCents(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400">Currency</label>
                <input
                  type="text"
                  maxLength={3}
                  value={ttCurrency}
                  onChange={(e) => setTtCurrency(e.target.value.toUpperCase())}
                  required
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={ttQuantityTotal}
                  onChange={(e) => setTtQuantityTotal(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>
            {ttError && <p className="text-sm text-red-600 dark:text-red-400">{ttError}</p>}
            <button
              type="submit"
              disabled={ttSubmitting}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {ttSubmitting ? "Adding…" : "Add ticket type"}
            </button>
          </form>
        </div>

        <p className="mt-6">
          <Link href={`/events/${eventId}`} className="text-sm text-zinc-600 underline dark:text-zinc-400">
            View public event page
          </Link>
        </p>
      </main>
    </div>
  );
}

export default function OrganizerEventPage() {
  return (
    <Protected>
      <OrganizerEventContent />
    </Protected>
  );
}
