import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { ProductForm } from "@/components/admin/ProductForm"
import type { Database } from "@/types/database"

export const dynamic = "force-dynamic"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]
type ImageRow = Database["public"]["Tables"]["product_images"]["Row"]
type VariantRow = Database["public"]["Tables"]["product_variants"]["Row"]

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !product) notFound()

  const productData = product as ProductRow

  const [{ data: images }, { data: variants }, { data: categories }] =
    await Promise.all([
      supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("product_variants")
        .select("size, color, color_hex, inventory_count")
        .eq("product_id", id),
      supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true }),
    ])

  const imageRows = (images ?? []) as Pick<ImageRow, "image_url">[]
  const variantRows = (variants ?? []) as Pick<
    VariantRow,
    "size" | "color" | "color_hex" | "inventory_count"
  >[]

  const sizes = variantRows.map((v) => v.size).filter((v, i, a) => a.indexOf(v) === i && v !== "Default")
  const colorMap = new Map<string, string>()
  variantRows.forEach((v) => {
    if (v.color !== "Default" && v.color_hex) colorMap.set(v.color, v.color_hex)
  })
  const colors = Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Edit Product
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Update {productData.name}
        </p>
      </div>
      <ProductForm
        categories={categories ?? []}
        initialData={{
          id: productData.id,
          name: productData.name,
          slug: productData.slug,
          description: productData.description ?? undefined,
          category_id: productData.category_id ?? undefined,
          price: productData.price,
          sale_price: productData.sale_price ?? null,
          inventory_count: productData.inventory_count,
          craft_type: productData.craft_type ?? undefined,
          cover_url: productData.cover_url,
          is_active: productData.is_active,
          is_featured: productData.is_featured ?? false,
          sizes,
          colors,
          gallery_urls: imageRows.map((i) => i.image_url),
        }}
      />
    </div>
  )
}
