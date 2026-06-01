"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link
      href="/cart"
      className="inline-flex items-center gap-2 rounded-full border border-ethereal-silver/50 bg-white/70 px-3 py-1.5 text-foreground/75 transition-colors hover:border-ethereal-maroon hover:text-ethereal-maroon"
      aria-label={`Cart, ${cartItemsCount} items`}
    >
      <ShoppingBag className="h-4 w-4" />
      <span className="hidden text-xs font-bold uppercase tracking-[0.16em] md:inline">
        Cart - {cartItemsCount}
      </span>
      {cartItemsCount > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ethereal-maroon px-1 text-[10px] font-bold text-white md:hidden">
          {cartItemsCount}
        </span>
      )}
    </Link>
  );
}
