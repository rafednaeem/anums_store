import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryActions } from "./CategoryActions"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const supabase = createAdminClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, sort_order, is_active, image_url")
    .order("sort_order", { ascending: true })

  const cats = (categories ?? []) as Array<{
    id: string
    name: string
    slug: string
    parent_id: string | null
    sort_order: number
    is_active: boolean
    image_url: string | null
  }>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Categories
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Organize your products into categories
        </p>
      </div>

      <CategoryActions categories={cats} />
    </div>
  )
}
