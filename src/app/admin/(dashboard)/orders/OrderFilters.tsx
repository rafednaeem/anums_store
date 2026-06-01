"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const STATUSES = ["", "new", "confirmed", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_STATUSES = ["", "pending", "paid", "failed"] as const;

export default function OrderFilters({
  currentStatus,
  currentPaymentStatus,
}: {
  currentStatus: string;
  currentPaymentStatus: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/admin/orders?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <select
        value={currentStatus}
        onChange={(e) => setFilter("status", e.target.value)}
        className="border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-blush"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s ? `Status: ${s.charAt(0).toUpperCase() + s.slice(1)}` : "All Statuses"}
          </option>
        ))}
      </select>

      <select
        value={currentPaymentStatus}
        onChange={(e) => setFilter("payment_status", e.target.value)}
        className="border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-blush"
      >
        {PAYMENT_STATUSES.map((ps) => (
          <option key={ps} value={ps}>
            {ps
              ? `Payment: ${ps.charAt(0).toUpperCase() + ps.slice(1)}`
              : "All Payments"}
          </option>
        ))}
      </select>

      {(currentStatus || currentPaymentStatus) && (
        <button
          onClick={() => router.push("/admin/orders")}
          className="border-2 border-gray-300 px-3 py-2 text-sm font-bold text-gray-600 transition-colors hover:border-gray-400"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
