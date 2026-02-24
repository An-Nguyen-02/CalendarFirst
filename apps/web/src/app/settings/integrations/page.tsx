"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/contexts/AuthContext";
import { apiJson, getApiBase } from "@/lib/api";

type GoogleStatus = {
  connected: boolean;
  email?: string;
  scopes?: string[];
};

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  const connected = searchParams.get("connected") === "1";
  const errorParam = searchParams.get("error");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiJson<GoogleStatus>(getApiBase() + "/integrations/google", { token })
      .then(setStatus)
      .catch(() => setError("Failed to load status"))
      .finally(() => setLoading(false));
  }, [getToken, connected]);

  async function handleConnectGoogle() {
    const token = getToken();
    if (!token) return;
    setConnecting(true);
    setError("");
    try {
      const data = await apiJson<{ redirectUrl: string }>(
        getApiBase() + "/auth/google/start",
        { token }
      );
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
    } catch (err) {
      setError("Failed to start Google sign-in");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-zinc-600 hover:underline dark:text-zinc-400">
            ← Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Integrations
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Connect your accounts for calendar sync.
        </p>

        {connected && !errorParam && (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Google Calendar connected successfully.
          </p>
        )}
        {errorParam && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
            {errorParam === "invalid_state"
              ? "Link expired or invalid. Please try again."
              : errorParam === "exchange_failed"
                ? "Could not complete sign-in with Google."
                : errorParam === "save_failed"
                  ? "Connection saved but something went wrong."
                  : "Something went wrong. Please try again."}
          </p>
        )}
        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Google Calendar
          </h2>
          {loading ? (
            <p className="mt-2 text-sm text-zinc-500">Loading…</p>
          ) : status?.connected ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Connected{status.email ? ` as ${status.email}` : ""}.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Connect your Google account to sync events and add purchased tickets to your calendar.
              </p>
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={connecting}
                className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {connecting ? "Redirecting…" : "Connect Google Calendar"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Protected>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <p className="text-zinc-500">Loading…</p>
          </div>
        }
      >
        <IntegrationsContent />
      </Suspense>
    </Protected>
  );
}
