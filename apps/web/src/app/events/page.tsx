"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiJson } from "@/lib/api";
import type { EventsResponse } from "@/types/api";

export default function EventsPage() {
  const [events, setEvents] = useState<EventsResponse["events"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiJson<EventsResponse>("/events")
      .then((data) => setEvents(data.events))
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

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
        {loading && <p className="mt-4 text-zinc-500">Loading…</p>}
        {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className="mt-4 text-zinc-500">No published events yet.</p>
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
