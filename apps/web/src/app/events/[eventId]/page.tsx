"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiJson } from "@/lib/api";
import { formatCents, formatDate } from "@/lib/format";
import type {
  EventSummary,
  TicketTypeSummary,
  TicketTypesResponse,
  CreateOrderBody,
  CheckoutResponse,
} from "@/types/api";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { user, getToken } = useAuth();
  const [event, setEvent] = useState<EventSummary | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    Promise.all([
      apiJson<EventSummary>(`/events/${eventId}`),
      apiJson<TicketTypesResponse>(`/events/${eventId}/ticket-types`),
    ])
      .then(([ev, tt]) => {
        setEvent(ev);
        setTicketTypes(tt.ticketTypes);
        const initial: Record<string, number> = {};
        tt.ticketTypes.forEach((t) => (initial[t.id] = 0));
        setQuantities(initial);
      })
      .catch(() => setError("Event not found"))
      .finally(() => setLoading(false));
  }, [eventId]);

  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    if (totalQty < 1) {
      setSubmitError("Select at least one ticket.");
      return;
    }
    if (!user) {
      router.push(`/login?next=/events/${eventId}`);
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    const token = getToken();
    if (!token) {
      router.push(`/login?next=/events/${eventId}`);
      setSubmitting(false);
      return;
    }
    const items = Object.entries(quantities)
      .filter(([, q]) => q > 0)
      .map(([ticketTypeId, qty]) => ({ ticketTypeId, qty }));
    try {
      const order = await apiJson<{ order: { id: string } }>(
        `/events/${eventId}/orders`,
        {
          method: "POST",
          token,
          body: JSON.stringify({ items } as CreateOrderBody),
        }
      );
      const checkout = await apiJson<CheckoutResponse>(
        `/orders/${order.order.id}/checkout`,
        { method: "POST", token }
      );
      if (checkout.url) window.location.href = checkout.url;
      else setSubmitError("Checkout URL not received.");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { error?: string } }).data?.error ?? "Order failed")
          : "Order failed";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
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
          <Link href="/events" className="mt-4 inline-block underline">
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
          <Link href="/events" className="text-zinc-600 hover:underline dark:text-zinc-400">
            ← Events
          </Link>
          <Link href="/orders" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
            My orders
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {event.title}
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          {formatDate(event.startAt, "long")}
          {event.venue && ` · ${event.venue}`}
        </p>
        {event.description && (
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            {event.description}
          </p>
        )}

        {ticketTypes.length === 0 ? (
          <p className="mt-6 text-zinc-500">No ticket types available.</p>
        ) : (
          <form onSubmit={handleBuy} className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Tickets
            </h2>
            <ul className="mt-4 space-y-4">
              {ticketTypes.map((tt) => {
                const available = tt.quantityTotal - tt.quantitySold;
                return (
                  <li key={tt.id} className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {tt.name}
                      </span>
                      <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                        {formatCents(tt.priceCents)} · {available} left
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor={`qty-${tt.id}`} className="sr-only">
                        Quantity for {tt.name}
                      </label>
                      <input
                        id={`qty-${tt.id}`}
                        type="number"
                        min={0}
                        max={available}
                        value={quantities[tt.id] ?? 0}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [tt.id]: Math.max(0, parseInt(e.target.value, 10) || 0),
                          }))
                        }
                        className="w-20 rounded border border-zinc-300 bg-white px-2 py-1 text-right dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            {submitError && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting || totalQty < 1}
              className="mt-6 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {!user
                ? "Sign in to buy"
                : submitting
                  ? "Processing…"
                  : totalQty < 1
                    ? "Select tickets"
                    : "Continue to payment"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
