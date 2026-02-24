"use client";

import Link from "next/link";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/contexts/AuthContext";

function ProfileContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-zinc-600 hover:underline dark:text-zinc-400">
            ← Home
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Profile
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your account and connected services.
        </p>

        <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Account
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {user?.email}
          </p>
          {user?.role && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
              Role: {user.role}
            </p>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Integrations
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Connect your calendar to sync events and add purchased tickets to your calendar.
          </p>
          <Link
            href="/settings/integrations"
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Manage integrations
          </Link>
        </section>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Protected>
      <ProfileContent />
    </Protected>
  );
}
