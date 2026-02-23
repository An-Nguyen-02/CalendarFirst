"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/contexts/AuthContext";
import { apiJson } from "@/lib/api";
import type { OrderSummary } from "@/types/api";

function OrderDetailContent() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { getToken } = useAuth();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token || !orderId) return;
    apiJson<OrderSummary>(`/orders/${orderId}`, { token })
      .then(setOrder)
      .catch(() => setError("Order not found"))
      .finally(() => setLoading(false));
  }, [orderId, getToken]);

  const formatCents = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100);

  const formatDate = (s: string) =>
    new Date(s).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  async function handleCancel() {
    if (!orderId || order?.status !== "CREATED") return;
    const token = getToken();
    if (!token) return;
    setCancelling(true);
    try {
      await apiJson(`/orders/${orderId}/cancel`, { method: "POST", token });
      setOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
    } catch {
      setError("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Loading order…</p>
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || "Not found"}</p>
          <Link href="/orders" className="mt-4 inline-block underline">
            Back to My orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/orders" className="text-zinc-600 hover:underline dark:text-zinc-400">
            ← My orders
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {order.event.title}
            </h1>
            <span
              className={`rounded px-2 py-1 text-sm ${
                order.status === "PAID"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : order.status === "CREATED"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(order.createdAt)}
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {order.event.venue && `${order.event.venue} · `}
            {formatDate(order.event.startAt)}
          </p>

          <ul className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-700">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between py-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <span>
                  {item.qty}× {item.ticketType.name}
                </span>
                <span>{formatCents(item.qty * item.unitPriceCents)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-zinc-200 pt-4 text-base font-medium dark:border-zinc-700">
            <span>Total</span>
            <span>{formatCents(order.totalCents)}</span>
          </p>

          {order.status === "CREATED" && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/orders/${order.id}/checkout`}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Pay now
              </Link>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {cancelling ? "Cancelling…" : "Cancel order"}
              </button>
            </div>
          )}
          {order.status === "PAID" && (
            <Link
              href={`/events/${order.event.id}`}
              className="mt-6 inline-block text-sm text-zinc-600 underline dark:text-zinc-400"
            >
              View event
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Protected>
      <OrderDetailContent />
    </Protected>
  );
}
