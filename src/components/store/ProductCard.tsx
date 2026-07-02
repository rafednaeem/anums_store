"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    compare_price: number | null
    sale_price: number | null
    is_on_sale: boolean
    cover_url: string | null
    inventory_count: number
    category?: { name: string } | null
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const displayPrice =
    product.is_on_sale && product.sale_price ? product.sale_price : product.price

  const isLowStock = product.inventory_count > 0 && product.inventory_count < 5
  const isOutOfStock = product.inventory_count <= 0

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
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </motion.div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsWishlisted(!isWishlisted)
            }}
            className={cn(
              "absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white",
              isWishlisted && "bg-ethereal-maroon/10"
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted
                  ? "fill-ethereal-maroon text-ethereal-maroon"
                  : "text-muted-foreground"
              )}
            />
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
            {product.is_on_sale && product.compare_price && (
              <span className="text-xs text-muted-foreground line-through">
                Rs. {product.compare_price.toLocaleString()}
              </span>
            )}
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
