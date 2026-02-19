"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/contexts/AuthContext";
import { apiJson } from "@/lib/api";
import type { OrgsResponse } from "@/types/api";

function OrgsContent() {
  const { user, logout, getToken } = useAuth();
  const [orgs, setOrgs] = useState<OrgsResponse["orgs"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiJson<OrgsResponse>("/orgs", { token })
      .then((data) => setOrgs(data.orgs))
      .catch(() => setError("Failed to load orgs"))
      .finally(() => setLoading(false));
  }, [getToken]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            CalSync Events
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {user?.email}
            </span>
            <Link href="/orders" className="text-sm underline hover:no-underline">
              My orders
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          My organizations
        </h1>
        {loading && <p className="mt-4 text-zinc-500">Loading…</p>}
        {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}
        {!loading && !error && orgs.length === 0 && (
          <p className="mt-4 text-zinc-500">You are not in any organizations.</p>
        )}
        {!loading && !error && orgs.length > 0 && (
          <ul className="mt-6 space-y-3">
            {orgs.map((org) => (
              <li key={org.id}>
                <Link
                  href={`/orgs/${org.id}/events`}
                  className="block rounded-lg border border-zinc-200 bg-white p-4 font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  {org.name}
                  <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
                    {org.role}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default function OrgsPage() {
  return (
    <Protected>
      <OrgsContent />
    </Protected>
  );
}
