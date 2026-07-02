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

  const { data: images } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", id)
    .order("sort_order", { ascending: true })

  const imageRows = (images ?? []) as Pick<ImageRow, "image_url">[]

  const { data: variants } = await supabase
    .from("product_variants")
    .select("size, color, color_hex")
    .eq("product_id", id)

  const variantRows = (variants ?? []) as Pick<VariantRow, "size" | "color" | "color_hex">[]

  const sizes = variantRows.map((v) => v.size).filter((v, i, a) => a.indexOf(v) === i)
  const colorMap = new Map<string, string>()
  variantRows.forEach((v) => {
    if (v.color_hex) colorMap.set(v.color, v.color_hex)
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
        initialData={{
          id: productData.id,
          name: productData.name,
          slug: productData.slug,
          description: productData.description ?? undefined,
          category_id: productData.category_id ?? undefined,
          price: productData.price,
          compare_price: productData.compare_price,
          sale_price: productData.sale_price,
          inventory_count: productData.inventory_count,
          craft_type: productData.craft_type ?? undefined,
          cover_url: productData.cover_url,
          is_active: productData.is_active,
          sizes,
          colors,
          gallery_urls: imageRows.map((i) => i.image_url),
        }}
      />
    </div>
  )
}
