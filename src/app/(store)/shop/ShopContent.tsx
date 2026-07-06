"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/store/ProductCard"
import ProductGridSkeleton from "@/components/store/ProductGridSkeleton"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  sale_price: number | null
  is_on_sale: boolean
  cover_url: string | null
  inventory_count: number
  created_at?: string
  category?: { name: string; slug: string } | null
  product_images?: { image_url: string; is_primary: boolean; sort_order: number }[]
}

interface Category {
  id: string
  name: string
  slug: string
}

interface ShopContentProps {
  products: Product[]
  categories: Category[]
  activeCategory?: string
}

export default function ShopContent({
  products,
  categories,
  activeCategory,
}: ShopContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("newest")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const productsWithImage = useMemo(() => {
    return products.map((p) => ({
      ...p,
      cover_url: p.cover_url || p.product_images?.find((img) => img.is_primary)?.image_url || p.product_images?.sort((a, b) => a.sort_order - b.sort_order)?.[0]?.image_url || null,
    }))
  }, [products])

  const sortedAndFiltered = useMemo(() => {
    let result = [...productsWithImage]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q)
      )
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "newest":
      default:
        result.sort((a, b) => {
          const aDate = a.created_at
            ? new Date(String(a.created_at)).getTime()
            : 0
          const bDate = b.created_at
            ? new Date(String(b.created_at)).getTime()
            : 0
          return bDate - aDate
        })
        break
    }

    return result
  }, [productsWithImage, search, sort])

  function handleCategoryChange(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set("category", slug)
    } else {
      params.delete("category")
    }
    router.push(`/shop?${params.toString()}`, { scroll: false })
    setMobileFiltersOpen(false)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <h2 className="font-heading text-lg font-bold text-ethereal-dark">
            Categories
          </h2>
          <div className="mt-4 space-y-1">
            <button
              onClick={() => handleCategoryChange(null)}
              className={cn(
                "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                !activeCategory
                  ? "bg-ethereal-dark text-white"
                  : "text-muted-foreground hover:bg-ethereal-cream hover:text-ethereal-dark"
              )}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={cn(
                  "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                  activeCategory === cat.slug
                    ? "bg-ethereal-dark text-white"
                    : "text-muted-foreground hover:bg-ethereal-cream hover:text-ethereal-dark"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-ethereal-dark">
                Shop
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {sortedAndFiltered.length} product
                {sortedAndFiltered.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 sm:w-64"
                />
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="flex h-10 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Filters */}
          {mobileFiltersOpen && (
            <div className="mt-4 rounded-lg border border-ethereal-silver/30 bg-white p-4 lg:hidden">
              <h3 className="font-medium text-ethereal-dark">Categories</h3>
              <div className="mt-3 space-y-1">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={cn(
                    "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                    !activeCategory
                      ? "bg-ethereal-dark text-white"
                      : "text-muted-foreground hover:bg-ethereal-cream"
                  )}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={cn(
                      "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                      activeCategory === cat.slug
                        ? "bg-ethereal-dark text-white"
                        : "text-muted-foreground hover:bg-ethereal-cream"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="mt-8">
            {sortedAndFiltered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-ethereal-silver/50 bg-ethereal-cream/30 py-20 text-center">
                <p className="font-heading text-lg font-semibold text-ethereal-dark">
                  No products found
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearch("")
                    handleCategoryChange(null)
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {sortedAndFiltered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
