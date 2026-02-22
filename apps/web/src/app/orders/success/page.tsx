"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Payment successful
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Thank you for your purchase. Your order has been confirmed.
          {orderId && (
            <span className="mt-2 block text-sm text-zinc-500">
              Order ID: {orderId}
            </span>
          )}
        </p>
        <Link
          href="/orders"
          className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          View my orders
        </Link>
      </main>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950"><span className="text-zinc-500">Loading…</span></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
