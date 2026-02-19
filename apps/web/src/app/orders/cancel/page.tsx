"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OrderCancelPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Payment cancelled
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          You cancelled the checkout. Your order is still pending if you want to
          pay later.
          {orderId && (
            <span className="mt-2 block text-sm text-zinc-500">
              Order ID: {orderId}
            </span>
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href={orderId ? `/orders/${orderId}/checkout` : "/orders"}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {orderId ? "Try again" : "My orders"}
          </Link>
          <Link
            href="/events"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Browse events
          </Link>
        </div>
      </main>
    </div>
  );
}
