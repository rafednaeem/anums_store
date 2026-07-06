import { createAdminClient } from "@/lib/supabase/admin"
import { ProductForm } from "@/components/admin/ProductForm"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const supabase = createAdminClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Add Product
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Create a new product
        </p>
      </div>
      <ProductForm categories={categories ?? []} />
    </div>
  )
}
