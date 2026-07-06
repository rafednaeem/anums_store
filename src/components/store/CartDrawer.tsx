"use client"

import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface CartDrawerProps {
  itemCount?: number
  className?: string
}

export default function CartDrawer({ itemCount = 0, className }: CartDrawerProps) {
  return (
    <Link
      href="/cart"
      className={cn(
        "relative inline-flex items-center justify-center rounded-md p-2 text-sm transition-colors hover:bg-ethereal-cream",
        className
      )}
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      <span className="sr-only">Shopping cart</span>
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ethereal-maroon text-[10px] font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  )
}
