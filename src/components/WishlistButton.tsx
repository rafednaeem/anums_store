"use client";

import { Heart } from "lucide-react";
import { useWishlistStore, WishlistItem } from "@/store/useWishlistStore";

export default function WishlistButton({ item }: { item: WishlistItem }) {
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(item.id));
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const inList = isInWishlist;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(item);
      }}
      aria-label={inList ? "Remove from wishlist" : "Add to wishlist"}
      className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          inList ? "fill-ethereal-maroon text-ethereal-maroon" : "text-gray-500"
        }`}
      />
    </button>
  );
}
