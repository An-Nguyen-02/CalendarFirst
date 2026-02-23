"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/contexts/AuthContext";
import { apiJson } from "@/lib/api";
import type { OrderSummary, OrdersResponse } from "@/types/api";

function OrdersContent() {
  const { user, logout, getToken } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiJson<OrdersResponse>("/orders", { token })
      .then((data) => setOrders(data.orders))
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, [getToken]);

  const formatCents = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(cents / 100);

  const formatDate = (s: string) =>
    new Date(s).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });

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
            <button
              type="button"
              onClick={logout}
              className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          My orders
        </h1>
        {loading && (
          <p className="mt-4 text-zinc-500">Loading orders…</p>
        )}
        {error && (
          <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
        )}
        {!loading && !error && orders.length === 0 && (
          <p className="mt-4 text-zinc-500">
            No orders yet.{" "}
            <Link href="/events" className="underline">
              Browse events
            </Link>
          </p>
        )}
        {!loading && !error && orders.length > 0 && (
          <ul className="mt-6 space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Link href={`/orders/${order.id}`} className="block">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {order.event.title}
                    </span>
                  <span
                    className={`rounded px-2 py-0.5 text-sm ${
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
                    {formatDate(order.createdAt)} · {formatCents(order.totalCents)}
                  </p>
                  <ul className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.qty}× {item.ticketType.name}
                      </li>
                    ))}
                  </ul>
                </Link>
                {order.status === "CREATED" && (
                  <Link
                    href={`/orders/${order.id}/checkout`}
                    className="mt-3 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
                  >
                    Pay now
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Protected>
      <OrdersContent />
    </Protected>
  );
}
