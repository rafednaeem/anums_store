"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateOrderStatus } from "./actions";

const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"];

export default function BulkStatusBar({
  selectedIds,
  onCancel,
}: {
  selectedIds: string[];
  onCancel: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("confirmed");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (selectedIds.length === 0) return null;

  const updateSelected = () => {
    setError("");
    startTransition(async () => {
      const results = await Promise.allSettled(
        selectedIds.map((orderId) => updateOrderStatus(orderId, status)),
      );
      const failed = results.filter(
        (result) =>
          result.status === "rejected" ||
          (result.status === "fulfilled" && "error" in result.value),
      );

      if (failed.length > 0) {
        setError(`${failed.length} update${failed.length === 1 ? "" : "s"} failed.`);
        return;
      }

      onCancel();
      router.refresh();
    });
  };

  return (
    <div className="mb-4 flex flex-col gap-3 border border-ethereal-silver/50 bg-ethereal-cream p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-bold text-foreground">{selectedIds.length} orders selected</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="border border-ethereal-silver bg-white px-3 py-2 text-sm outline-none focus:border-ethereal-blush"
        >
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={updateSelected}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-[#1a4a4a] px-4 py-2 text-sm font-bold text-white hover:bg-foreground disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Selected
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="border border-ethereal-silver px-4 py-2 text-sm font-bold text-foreground/70 hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
