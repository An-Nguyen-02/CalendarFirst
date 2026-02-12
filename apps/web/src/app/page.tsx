"use client";

import { useEffect, useState } from "react";

type Health = { status: string; timestamp?: string } | null;

export default function Home() {
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
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
      </main>
    </div>
  );
}
