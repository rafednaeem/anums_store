"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/helpers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import ProductCard from "@/components/store/ProductCard"

interface Variant {
  id: string
  size: string
  color: string
  color_hex: string | null
  sku: string | null
  inventory_count: number
  is_active: boolean
}

interface ProductDetailProps {
  product: {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    sale_price: number | null
    is_on_sale: boolean
    inventory_count: number
    cover_url: string | null
    category?: { id: string; name: string; slug: string } | null
    images: string[]
    variants: Variant[]
  }
}

interface Review {
  id: string
  name: string
  rating: number
  title: string | null
  body: string
  created_at: string
}

export default function ProductDetailContent({ product }: ProductDetailProps) {
  const { addItem } = useCart()
  const supabase = createClient()

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [avgRating, setAvgRating] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<unknown[]>([])

  const uniqueSizes = useMemo(() => {
    return Array.from(new Set(product.variants.map((v) => v.size)))
  }, [product.variants])

  const uniqueColors = useMemo(() => {
    const colorMap = new Map<string, { name: string; hex: string | null }>()
    product.variants.forEach((v) => {
      if (!colorMap.has(v.color)) {
        colorMap.set(v.color, { name: v.color, hex: v.color_hex })
      }
    })
    return Array.from(colorMap.values())
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    return product.variants.find(
      (v) =>
        v.size === selectedSize &&
        v.color === selectedColor &&
        v.is_active
    )
  }, [product.variants, selectedSize, selectedColor])

  useEffect(() => {
    if (uniqueSizes.length > 0 && !selectedSize) {
      setSelectedSize(uniqueSizes[0])
    }
    if (uniqueColors.length > 0 && !selectedColor) {
      setSelectedColor(uniqueColors[0].name)
    }
  }, [uniqueSizes, uniqueColors, selectedSize, selectedColor])

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`)
        const data = await res.json()
        if (data.reviews) {
          setReviews(data.reviews)
          setAvgRating(data.avgRating || 0)
        }
      } catch {
        // ignore
      } finally {
        setReviewsLoading(false)
      }
    }
    fetchReviews()
  }, [product.id])

  useEffect(() => {
    async function fetchRelated() {
      if (!product.category?.id) return
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(name, slug), product_images(image_url, is_primary, sort_order)")
        .eq("is_active", true)
        .eq("category_id", product.category.id)
        .neq("id", product.id)
        .limit(4)

      if (data) {
        const withCover = data.map((p: Record<string, unknown> & { cover_url: string | null; product_images?: { image_url: string; is_primary: boolean; sort_order: number }[] }) => ({
          ...p,
          cover_url: p.cover_url || p.product_images?.find((img) => img.is_primary)?.image_url || p.product_images?.sort((a, b) => a.sort_order - b.sort_order)?.[0]?.image_url || null,
        }))
        setRelatedProducts(withCover)
      }
    }
    fetchRelated()
  }, [product.category?.id, product.id, supabase])

  const handleAddToCart = useCallback(() => {
    setIsAdding(true)

    addItem({
      product_id: product.id,
      variant_id: selectedVariant?.id || null,
      name: product.name,
      price:
        product.is_on_sale && product.sale_price
          ? product.sale_price
          : product.price,
      quantity,
      image: product.images[selectedImage] || product.cover_url || undefined,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    })

    setTimeout(() => setIsAdding(false), 600)
  }, [
    addItem,
    product,
    selectedVariant,
    quantity,
    selectedImage,
    selectedSize,
    selectedColor,
  ])

  const displayPrice =
    product.is_on_sale && product.sale_price
      ? product.sale_price
      : product.price

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-ethereal-dark">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-ethereal-dark">
          Shop
        </Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="hover:text-ethereal-dark"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ethereal-dark">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-ethereal-cream">
            {product.images.length > 0 ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : product.cover_url ? (
              <Image
                src={product.cover_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}

            {product.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-colors hover:bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev === product.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-colors hover:bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {product.is_on_sale && (
              <Badge className="absolute left-3 top-3 border-ethereal-maroon bg-ethereal-maroon text-white">
                Sale
              </Badge>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                    selectedImage === i
                      ? "border-ethereal-dark"
                      : "border-ethereal-silver/30 hover:border-ethereal-dark/50"
                  )}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-ethereal-dark">
            {product.name}
          </h1>

          {product.category && (
            <p className="mt-2 text-sm text-muted-foreground">
              {product.category.name}
            </p>
          )}

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-ethereal-silver"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-heading text-2xl font-bold text-ethereal-dark">
              {formatPrice(displayPrice)}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-ethereal-dark">
                Description
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          {/* Size Selector */}
          {uniqueSizes.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-ethereal-dark">
                Size
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                      selectedSize === size
                        ? "border-ethereal-dark bg-ethereal-dark text-white"
                        : "border-ethereal-silver/30 hover:border-ethereal-dark/50"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {uniqueColors.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-ethereal-dark">
                Color
              </h2>
              <div className="mt-2 flex flex-wrap gap-3">
                {uniqueColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      selectedColor === color.name
                        ? "border-ethereal-dark bg-ethereal-dark/5"
                        : "border-ethereal-silver/30 hover:border-ethereal-dark/50"
                    )}
                  >
                    {color.hex && (
                      <span
                        className="h-4 w-4 rounded-full border border-ethereal-silver/50"
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant Info */}
          {selectedVariant && (
            <div className="mt-4 rounded-md bg-ethereal-cream/50 p-3 text-sm">
              {selectedVariant.sku && (
                <p className="text-muted-foreground">
                  SKU: <span className="font-medium text-ethereal-dark">{selectedVariant.sku}</span>
                </p>
              )}
              <p className="text-muted-foreground">
                Stock:{" "}
                <span
                  className={cn(
                    "font-medium",
                    selectedVariant.inventory_count > 0
                      ? "text-ethereal-dark"
                      : "text-red-500"
                  )}
                >
                  {selectedVariant.inventory_count > 0
                    ? `${selectedVariant.inventory_count} available`
                    : "Out of stock"}
                </span>
              </p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-md border border-ethereal-silver/30">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-ethereal-cream"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-10 w-12 items-center justify-center border-x border-ethereal-silver/30 text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-ethereal-cream"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={
                isAdding ||
                (selectedVariant !== undefined && selectedVariant?.inventory_count === 0) ||
                (!selectedVariant && product.inventory_count === 0)
              }
              className="flex-1 bg-ethereal-dark text-white hover:bg-ethereal-dark/90"
              size="lg"
            >
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isAdding
                ? "Added!"
                : product.inventory_count === 0 ||
                  (selectedVariant && selectedVariant.inventory_count === 0)
                ? "Out of Stock"
                : "Add to Cart"}
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 rounded-lg border border-ethereal-silver/30 p-4 text-center text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-ethereal-dark">Free Shipping</p>
              <p className="mt-1">On orders over Rs. 10,000</p>
            </div>
            <div>
              <p className="font-semibold text-ethereal-dark">Easy Returns</p>
              <p className="mt-1">7-day return policy</p>
            </div>
            <div>
              <p className="font-semibold text-ethereal-dark">Secure Payment</p>
              <p className="mt-1">100% secure checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-bold text-ethereal-dark">
          Customer Reviews
        </h2>

        {reviewsLoading ? (
          <div className="mt-8 flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-ethereal-silver/50 bg-ethereal-cream/30 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-ethereal-silver/30 bg-white p-6"
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-ethereal-silver"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-ethereal-dark">
                    {review.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {review.title && (
                  <h3 className="mt-2 font-medium text-ethereal-dark">
                    {review.title}
                  </h3>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  {review.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading text-2xl font-bold text-ethereal-dark">
            You May Also Like
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {relatedProducts.map((rp: unknown) => {
              const related = rp as { id: string }
              return <ProductCard key={related.id} product={rp as ProductDetailProps["product"]} />
            })}
          </div>
        </section>
      )}
    </div>
  )
}
