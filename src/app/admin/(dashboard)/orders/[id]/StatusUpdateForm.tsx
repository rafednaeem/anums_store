"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "../actions";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;

export default function StatusUpdateForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [selected, setSelected] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    if (selected === currentStatus) return;
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, selected);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Status updated.");
      }
    });
  };

  return (
    <div className="space-y-3">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-blush"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={isPending || selected === currentStatus}
        className="flex w-full items-center justify-center gap-1 bg-ethereal-lavender px-4 py-2 text-sm font-bold uppercase tracking-widest text-ethereal-silver transition-colors hover:bg-ethereal-blush hover:text-white disabled:opacity-50"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Update Status
      </button>
    </div>
  );
}
