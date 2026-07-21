import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getPageContent } from "@/lib/cms"
import { storeName, storeUrl } from "@/lib/constants"
import HomeContent from "./HomeContent"

export const metadata: Metadata = {
  title: "Anums Store - Pakistani Fashion",
  description:
    "Discover curated Pakistani fashion — ready-to-wear, bridal, and accessories crafted with timeless elegance.",
  openGraph: {
    title: "Anums Store - Pakistani Fashion",
    description:
      "Discover curated Pakistani fashion — ready-to-wear, bridal, and accessories crafted with timeless elegance.",
    url: storeUrl,
    siteName: storeName,
    type: "website",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: storeName,
  url: storeUrl,
  description:
    "Curated Pakistani fashion — ready-to-wear, bridal, and accessories crafted with timeless elegance.",
  logo: `${storeUrl}/logo.png`,
  sameAs: [],
}

export default async function StoreHomePage() {
  const supabase = await createClient()

  const [content, { data: featuredProducts }] = await Promise.all([
    getPageContent("home"),
    supabase
      .from("products")
      .select("*, category:categories(name, slug), product_images(image_url, is_primary, sort_order)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(8),
  ])

  const featured = (featuredProducts || []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    sale_price: p.sale_price ?? null,
    is_on_sale: p.is_on_sale ?? false,
    cover_url: p.cover_url || p.product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.image_url || p.product_images?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)?.[0]?.image_url || null,
    inventory_count: p.inventory_count ?? 0,
    category: p.category ?? null,
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeContent content={content} products={featured} />
    </>
  )
}
