"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { deleteProductAction } from "./actions";
import type { SupabaseProduct } from "@/lib/supabase-products";

export default function ProductDeleteModal({
  product,
  onClose,
}: {
  product: SupabaseProduct;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProductAction(product.id);
      if (!("error" in result)) {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl">
        <h2 className="font-heading text-3xl text-foreground">Delete product?</h2>
        <p className="mt-3 text-sm text-foreground/65">
          &quot;{product.name}&quot; will be permanently removed.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="border border-ethereal-silver px-4 py-2 text-sm font-bold text-foreground/70 hover:bg-ethereal-cream"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
