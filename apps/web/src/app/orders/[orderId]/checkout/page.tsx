"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/contexts/AuthContext";
import { apiJson } from "@/lib/api";
import type { CheckoutResponse } from "@/types/api";

function CheckoutRedirectContent() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { getToken } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token || !orderId) return;
    apiJson<CheckoutResponse>(`/orders/${orderId}/checkout`, {
      method: "POST",
      token,
    })
      .then((data) => {
        if (data.url) window.location.href = data.url;
        else setError("No checkout URL received");
      })
      .catch((err: unknown) => {
        const msg =
          err && typeof err === "object" && "data" in err
            ? String((err as { data?: { error?: string } }).data?.error ?? "Checkout failed")
            : "Checkout failed";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [orderId, getToken]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Redirecting to checkout…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <a href="/orders" className="mt-4 inline-block text-sm underline">
            Back to orders
          </a>
        </div>
      </div>
    );
  }
  return null;
}

export default function CheckoutRedirectPage() {
  return (
    <Protected>
      <CheckoutRedirectContent />
    </Protected>
  );
}
