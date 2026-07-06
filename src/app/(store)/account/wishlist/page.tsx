"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { Heart, ChevronRight, Trash2 } from "lucide-react"

export const dynamic = "force-dynamic"
import { createClient } from "@/lib/supabase/client"
import AuthGuard from "@/components/shared/AuthGuard"
import ProductCard from "@/components/store/ProductCard"

interface WishlistProduct {
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

interface WishlistItem {
  id: string
  product_id: string
  product: WishlistProduct
}

export default function WishlistPage() {
  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <WishlistContent />
      </AuthGuard>
    </Suspense>
  )
}

function WishlistContent() {
  const supabase = createClient()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  async function fetchWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("wishlists")
      .select("id, product_id, product:products(id, name, slug, price, compare_price, sale_price, is_on_sale, cover_url, inventory_count, category:categories(name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      const list = data as unknown as Array<{
        id: string
        product_id: string
        product: WishlistProduct & { category: { name: string } | { name: string }[] | null }
      }>

      const formatted = list.map((item) => {
        const product = item.product
        const rawCategory = product.category
        const category = Array.isArray(rawCategory)
          ? rawCategory[0] ?? null
          : rawCategory
        return {
          id: item.id,
          product_id: item.product_id,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            compare_price: product.compare_price,
            sale_price: product.sale_price,
            is_on_sale: product.is_on_sale,
            cover_url: product.cover_url,
            inventory_count: product.inventory_count,
            category,
          },
        }
      })
      setItems(formatted)
    }
    setLoading(false)
  }

  async function handleRemove(wishlistId: string) {
    await supabase.from("wishlists").delete().eq("id", wishlistId)
    setItems((prev) => prev.filter((item) => item.id !== wishlistId))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-ethereal-dark">
          Account
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ethereal-dark">Wishlist</span>
      </div>

      <h1 className="mt-4 font-heading text-3xl font-bold text-ethereal-dark">
        My Wishlist
      </h1>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ethereal-maroon border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-ethereal-silver/50 bg-ethereal-cream/30 py-16 text-center">
          <Heart className="mb-4 h-12 w-12 text-ethereal-silver" />
          <p className="font-heading text-lg font-semibold text-ethereal-dark">
            Your wishlist is empty
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Save items you love to your wishlist.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center rounded-md bg-ethereal-dark px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ethereal-dark/90"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="relative">
              <ProductCard product={item.product} />
              <button
                onClick={() => handleRemove(item.id)}
                className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow-sm transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
