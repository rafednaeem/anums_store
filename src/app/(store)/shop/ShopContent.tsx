"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal, ChevronDown } from "lucide-react"
import { cms } from "@/lib/cms"
import ProductCard from "@/components/store/ProductCard"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  slug: string
  price: number
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
  content?: Record<string, string>
}

const ITEMS_PER_PAGE = 9

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
]

export default function ShopContent({
  products,
  categories,
  activeCategory,
  content = {},
}: ShopContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sort, setSort] = useState("newest")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const sortRef = useRef<HTMLDivElement>(null)

  const productsWithImage = useMemo(() => {
    return products.map((p) => ({
      ...p,
      cover_url:
        p.cover_url ||
        p.product_images?.find((img) => img.is_primary)?.image_url ||
        p.product_images?.sort((a, b) => a.sort_order - b.sort_order)?.[0]
          ?.image_url ||
        null,
    }))
  }, [products])

  const sortedAndFiltered = useMemo(() => {
    const result = [...productsWithImage]

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
  }, [productsWithImage, sort])

  const totalPages = Math.ceil(sortedAndFiltered.length / ITEMS_PER_PAGE)
  const paginatedProducts = sortedAndFiltered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  function handleCategoryChange(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set("category", slug)
    } else {
      params.delete("category")
    }
    router.push(`/shop?${params.toString()}`, { scroll: false })
    setMobileFiltersOpen(false)
    setCurrentPage(1)
  }

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Scroll-triggered animation for product cards
  useEffect(() => {
    const cards = document.querySelectorAll(".shop-product-card")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("shop-card-visible")
            }, index * 80)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [paginatedProducts])

  const activeCategoryName = activeCategory
    ? categories.find((c) => c.slug === activeCategory)?.name
    : null

  return (
    <section className="px-5 md:px-16 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-16 md:gap-16">
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:block">
          <div className="sticky top-32 space-y-12">
            {/* Category Filter */}
            <div className="space-y-6">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] border-b border-border/30 pb-4">
                Categories
              </h3>
              <ul className="space-y-4">
                <li>
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={cn(
                      "text-sm transition-colors text-left w-full",
                      !activeCategory
                        ? "text-ethereal-dark font-medium"
                        : "text-muted-foreground hover:text-ethereal-dark"
                    )}
                  >
                    All Collections
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={cn(
                        "text-sm transition-colors text-left w-full",
                        activeCategory === cat.slug
                          ? "text-ethereal-dark font-medium"
                          : "text-muted-foreground hover:text-ethereal-dark"
                      )}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="space-y-12">
          {/* Sorting & Count Bar */}
          <div className="flex justify-between items-center border-b border-border/30 pb-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Showing {paginatedProducts.length} of {sortedAndFiltered.length} Items
            </p>

            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] hover:text-ethereal-maroon transition-colors"
              >
                Sort By: {sortOptions.find((o) => o.value === sort)?.label}
                <ChevronDown className={cn("h-3 w-3 transition-transform", sortOpen && "rotate-180")} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border/30 shadow-lg z-20">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSort(option.value)
                        setSortOpen(false)
                        setCurrentPage(1)
                      }}
                      className={cn(
                        "block w-full text-left px-4 py-3 text-sm transition-colors hover:bg-muted",
                        sort === option.value
                          ? "text-ethereal-dark font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-ethereal-dark transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeCategoryName && (
                <span className="text-ethereal-dark">— {activeCategoryName}</span>
              )}
            </button>

            {mobileFiltersOpen && (
              <div className="mt-4 border border-border/30 bg-white p-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-[12px] font-semibold uppercase tracking-[0.1em]">
                    Categories
                  </h4>
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={cn(
                      "block w-full text-left py-2 text-sm transition-colors",
                      !activeCategory
                        ? "text-ethereal-dark font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    All Collections
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={cn(
                        "block w-full text-left py-2 text-sm transition-colors",
                        activeCategory === cat.slug
                          ? "text-ethereal-dark font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Grid */}
          {sortedAndFiltered.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-border/50 bg-muted/30 py-20 text-center">
              <p className="font-heading text-lg text-ethereal-dark">
                {cms(content, "empty_state", "title", "No products found")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {cms(content, "empty_state", "description", "Try adjusting your search or filter criteria.")}
              </p>
              <button
                onClick={() => handleCategoryChange(null)}
                className="mt-4 border border-ethereal-dark px-6 py-3 text-xs font-medium uppercase tracking-widest text-ethereal-dark hover:bg-ethereal-dark hover:text-white transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="shop-product-card">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-16 flex justify-center items-center gap-8 border-t border-border/30">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={cn(
                  "text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors",
                  currentPage === 1
                    ? "opacity-30 cursor-not-allowed"
                    : "text-ethereal-dark hover:text-ethereal-maroon"
                )}
              >
                Previous
              </button>

              <div className="flex gap-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors",
                        currentPage === page
                          ? "text-ethereal-dark border-b border-ethereal-dark"
                          : "text-muted-foreground hover:text-ethereal-dark"
                      )}
                    >
                      {String(page).padStart(2, "0")}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={cn(
                  "text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors",
                  currentPage === totalPages
                    ? "opacity-30 cursor-not-allowed"
                    : "text-ethereal-dark hover:text-ethereal-maroon"
                )}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
