"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

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
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

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
      if (isWishlisted) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id)
        setIsWishlisted(false)
        toast.success("Removed from wishlist")
      } else {
        const { error } = await supabase
          .from("wishlists")
          .insert({ user_id: user.id, product_id: product.id })
        if (error) {
          if (error.code === "23505") {
            setIsWishlisted(true)
            toast.info("Already in wishlist")
          } else {
            throw error
          }
        } else {
          setIsWishlisted(true)
          toast.success("Added to wishlist")
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg border border-ethereal-silver/30 bg-white transition-shadow hover:shadow-md">
        <div className="relative aspect-[3/4] overflow-hidden bg-ethereal-cream">
          {product.is_on_sale && (
            <Badge className="absolute left-2 top-2 z-10 border-ethereal-maroon bg-ethereal-maroon text-white">
              Sale
            </Badge>
          )}
          {isLowStock && (
            <Badge className="absolute right-2 top-2 z-10 border-amber-500 bg-amber-500 text-white">
              Low Stock
            </Badge>
          )}

          <motion.div
            className="relative h-full w-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {product.cover_url ? (
              <Image
                src={product.cover_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                unoptimized={product.cover_url.includes("supabase")}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </motion.div>

          <button
            type="button"
            onClick={handleWishlist}
            disabled={isLoading}
            className={cn(
              "absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-50",
              isWishlisted && "bg-ethereal-maroon/10"
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isWishlisted
                    ? "fill-ethereal-maroon text-ethereal-maroon"
                    : "text-muted-foreground"
                )}
              />
            )}
          </button>
        </div>

        <div className="p-4">
          {product.category && (
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {product.category.name}
            </p>
          )}
          <h3 className="mt-1 line-clamp-1 font-medium text-ethereal-dark group-hover:text-ethereal-maroon">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-ethereal-dark">
              Rs. {displayPrice.toLocaleString()}
            </span>
          </div>
          {isOutOfStock && (
            <p className="mt-1 text-xs text-red-500">Out of stock</p>
          )}
          {isLowStock && !isOutOfStock && (
            <p className="mt-1 text-xs text-amber-600">
              Only {product.inventory_count} left
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
