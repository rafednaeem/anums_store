import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import ShopContent from "./ShopContent"

export const metadata: Metadata = {
  title: "Shop | Anums Store",
  description:
    "Browse our curated collection of Pakistani fashion — ready-to-wear, bridal, and accessories crafted with timeless elegance.",
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const categorySlug =
    typeof params.category === "string" ? params.category : undefined

  let query = supabase
    .from("products")
    .select("*, category:categories(name, slug), product_images(image_url, is_primary, sort_order)")
    .eq("is_active", true)

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .eq("is_active", true)
      .single()

    if (cat) {
      query = query.eq("category_id", cat.id)
    }
  }

  const { data: products } = await query.order("created_at", { ascending: false })

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  return (
    <ShopContent
      products={products || []}
      categories={categories || []}
      activeCategory={categorySlug}
    />
  )
}
