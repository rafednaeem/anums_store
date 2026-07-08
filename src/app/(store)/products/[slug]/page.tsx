import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProductDetailContent from "./ProductDetailContent"
import { storeName, storeUrl } from "@/lib/constants"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select("name, description, price, sale_price, is_on_sale, cover_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!product) {
    return { title: "Product Not Found" }
  }

  const title = `${product.name} | ${storeName}`
  const description =
    product.description?.slice(0, 160) ||
    `Shop ${product.name} at ${storeName}. Pakistani fashion crafted with elegance.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${storeUrl}/products/${slug}`,
      siteName: storeName,
      images: product.cover_url ? [{ url: product.cover_url, width: 800, height: 1000 }] : [],
      type: "website",
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(id, name, slug), product_images(id, image_url, sort_order, is_primary), product_variants(id, size, color, color_hex, inventory_count, is_active)"
    )
    .eq("slug", slug)
    .single()

  if (!product || error) {
    notFound()
  }

  const images = (product.product_images || [])
    .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    .map((img: { image_url: string; is_primary: boolean }) => img.image_url)

  const variants = (product.product_variants || []).filter(
    (v: { is_active: boolean }) => v.is_active
  )

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    image: images.length > 0 ? images[0] : product.cover_url,
    sku: variants.length > 0 ? variants[0].sku : undefined,
    brand: { "@type": "Brand", name: storeName },
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.is_on_sale && product.sale_price ? product.sale_price : product.price,
      availability: product.inventory_count > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${storeUrl}/products/${slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailContent
        product={{
          ...product,
          images,
          variants,
        }}
      />
    </>
  )
}
