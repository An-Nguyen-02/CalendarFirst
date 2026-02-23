"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiJson } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { EventsResponse } from "@/types/api";

const EVENTS_PAGE_SIZE = 20;

function EventsContentInner({
  initialQ,
  initialUpcoming,
}: {
  initialQ: string;
  initialUpcoming: boolean;
}) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(initialQ);
  const [upcomingInput, setUpcomingInput] = useState(initialUpcoming);
  const [events, setEvents] = useState<EventsResponse["events"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (initialQ) params.set("q", initialQ);
    if (initialUpcoming) {
      params.set("from", new Date().toISOString());
    }
    params.set("limit", String(EVENTS_PAGE_SIZE));
    const query = params.toString();
    const url = query ? `/events?${query}` : "/events";
    let cancelled = false;
    apiJson<EventsResponse>(url)
      .then((data) => {
        if (!cancelled) setEvents(data.events);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load events");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialQ, initialUpcoming]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    const v = searchInput.trim();
    if (v) next.set("q", v);
    if (upcomingInput) next.set("upcoming", "1");
    const query = next.toString();
    router.push(query ? `/events?${query}` : "/events");
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            CalSync Events
          </Link>
          <Link href="/orders" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
            My orders
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Upcoming events
        </h1>

        <form onSubmit={handleSearchSubmit} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="events-q" className="sr-only">
              Search events
            </label>
            <input
              id="events-q"
              type="search"
              placeholder="Search by title or description…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={upcomingInput}
              onChange={(e) => setUpcomingInput(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-600"
            />
            Upcoming only
          </label>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Search
          </button>
        </form>

        {loading && <p className="mt-4 text-zinc-500">Loading…</p>}
        {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className="mt-4 text-zinc-500">
            {initialQ || initialUpcoming ? "No events match your filters." : "No published events yet."}
          </p>
        )}
        {!loading && !error && events.length > 0 && (
          <ul className="mt-6 space-y-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Link href={`/events/${event.id}`} className="block">
                  <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                    {event.title}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(event.startAt)}
                    {event.venue && ` · ${event.venue}`}
                  </p>
                  {event.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {event.description}
                    </p>
                  )}
                </Link>
                <Link
                  href={`/events/${event.id}`}
                  className="mt-3 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
                >
                  View & buy tickets
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function EventsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const upcoming = searchParams.get("upcoming") === "1";
  return (
    <EventsContentInner
      key={`${q}-${upcoming}`}
      initialQ={q}
      initialUpcoming={upcoming}
    />
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950"><p className="text-zinc-500">Loading…</p></div>}>
      <EventsContent />
    </Suspense>
  );
}
