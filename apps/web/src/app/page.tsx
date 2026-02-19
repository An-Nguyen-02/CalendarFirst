"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

type Health = { status: string; timestamp?: string } | null;

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [apiHealth, setApiHealth] = useState<Health>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: Health) => setApiHealth(data))
      .catch(() => setApiHealth({ status: "error" }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-4 px-4 py-4">
          {!authLoading &&
            (user ? (
              <>
                <Link
                  href="/orders"
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                >
                  My orders
                </Link>
                <Link
                  href="/orgs"
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                >
                  My orgs
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
                Sign in
              </Link>
            ))}
          <Link
            href="/events"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            Events
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          CalSync Events
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Calendar-first event management platform.
        </p>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
          {loading ? (
            <span className="text-zinc-500">Checking API…</span>
          ) : apiHealth?.status === "ok" ? (
            <span className="text-green-600 dark:text-green-400">
              API: ok
              {apiHealth.timestamp && (
                <span className="ml-2 text-sm text-zinc-500">
                  ({apiHealth.timestamp})
                </span>
              )}
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400">API: error</span>
          )}
        </div>
        <Link
          href="/events"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Browse events
        </Link>
      </main>
    </div>
  );
}
