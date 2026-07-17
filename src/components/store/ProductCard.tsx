"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useWishlist } from "@/hooks/useWishlist"

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    sale_price: number | null
    is_on_sale: boolean
    cover_url: string | null
    inventory_count: number
    category?: { name: string } | null
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const { isWishlisted, addItem, removeItem } = useWishlist()

  const displayPrice =
    product.is_on_sale && product.sale_price ? product.sale_price : product.price

  const isLowStock = product.inventory_count > 0 && product.inventory_count < 5
  const isOutOfStock = product.inventory_count <= 0

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please sign in to add to wishlist")
      router.push("/auth/login?redirect=/account/wishlist")
      return
    }

    setIsLoading(true)
    try {
      if (isWishlisted(product.id)) {
        await removeItem(product.id)
        toast.success("Removed from wishlist")
      } else {
        await addItem(product.id)
        toast.success("Added to wishlist")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block cursor-pointer">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[3/4] mb-6">
        {/* Category Badge */}
        {product.category && (
          <div className="absolute top-4 left-4 z-10 bg-ethereal-maroon text-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]">
            {product.category.name}
          </div>
        )}

        {/* Sale / Low Stock Badges */}
        {product.is_on_sale && (
          <div className="absolute top-4 right-4 z-10 bg-ethereal-dark text-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]">
            Sale
          </div>
        )}

        {/* Product Image */}
        <div className="relative h-full w-full overflow-hidden bg-muted">
          {product.cover_url ? (
            <Image
              src={product.cover_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={product.cover_url.includes("supabase")}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={isLoading}
          className={cn(
            "absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-50",
            isWishlisted(product.id) && "bg-ethereal-maroon/10"
          )}
          aria-label={
            isWishlisted(product.id)
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted(product.id)
                  ? "fill-ethereal-maroon text-ethereal-maroon"
                  : "text-muted-foreground"
              )}
            />
          )}
        </button>
      </div>

      {/* Product Info */}
      <h3 className="font-heading text-[22px] leading-[28px] text-ethereal-dark mb-1">
        {product.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {product.is_on_sale && product.sale_price
          ? "Limited time offer"
          : product.category?.name
            ? `From our ${product.category.name} collection`
            : "Handcrafted with care"}
      </p>
      <p className="text-lg text-ethereal-dark font-semibold">
        PKR {displayPrice.toLocaleString()}
      </p>

      {isOutOfStock && (
        <p className="mt-1 text-xs text-red-500">Out of stock</p>
      )}
      {isLowStock && !isOutOfStock && (
        <p className="mt-1 text-xs text-amber-600">
          Only {product.inventory_count} left
        </p>
      )}
    </Link>
  )
}
