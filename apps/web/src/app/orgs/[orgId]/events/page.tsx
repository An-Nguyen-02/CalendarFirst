"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/contexts/AuthContext";
import { apiJson } from "@/lib/api";
import type { EventsResponse } from "@/types/api";

function OrgEventsContent() {
  const params = useParams();
  const orgId = params.orgId as string;
  const { user, logout, getToken } = useAuth();
  const [events, setEvents] = useState<EventsResponse["events"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiJson<EventsResponse>(`/orgs/${orgId}/events`, { token })
      .then((data) => setEvents(data.events))
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, [orgId, getToken]);

  const formatDate = (s: string) =>
    new Date(s).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/orgs" className="text-zinc-600 hover:underline dark:text-zinc-400">
            ← Organizations
          </Link>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {user?.email}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Organization events
          </h1>
          <Link
            href={`/orgs/${orgId}/events/new`}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create event
          </Link>
        </div>
        {loading && <p className="mt-4 text-zinc-500">Loading…</p>}
        {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className="mt-4 text-zinc-500">No events in this organization.</p>
        )}
        {!loading && !error && events.length > 0 && (
          <ul className="mt-6 space-y-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Link href={`/orgs/${orgId}/events/${event.id}`} className="block">
                  <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                    {event.title}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(event.startAt)}
                    {event.venue && ` · ${event.venue}`}
                    <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                      {event.status}
                    </span>
                  </p>
                </Link>
                <Link
                  href={`/orgs/${orgId}/events/${event.id}`}
                  className="mt-2 inline-block text-sm underline"
                >
                  Manage
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default function OrgEventsPage() {
  return (
    <Protected>
      <OrgEventsContent />
    </Protected>
  );
}
