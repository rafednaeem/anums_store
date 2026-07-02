import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { CategoryActions } from "./CategoryActions"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const supabase = createAdminClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })

  const cats = (categories ?? []) as {
    id: string
    name: string
    slug: string
    parent_id: string | null
    sort_order: number
    is_active: boolean
  }[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Categories
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Organize your products
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <CategoriesTree categories={cats} />
        </CardContent>
      </Card>

      <CategoryActions />
    </div>
  )
}

function CategoriesTree({
  categories,
}: {
  categories: {
    id: string
    name: string
    slug: string
    parent_id: string | null
    sort_order: number
    is_active: boolean
  }[]
}) {
  const rootCategories = categories.filter((c) => !c.parent_id)
  const childMap = new Map<string, typeof categories>()
  categories.forEach((c) => {
    if (c.parent_id) {
      const children = childMap.get(c.parent_id) ?? []
      children.push(c)
      childMap.set(c.parent_id, children)
    }
  })

  function renderCategory(
    category: (typeof categories)[number],
    depth: number = 0
  ) {
    const children = childMap.get(category.id) ?? []

    return (
      <div key={category.id}>
        <div
          className="flex items-center gap-4 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800/50"
          style={{ paddingLeft: `${16 + depth * 24}px` }}
        >
          <div className="flex-1">
            <span className="font-medium">{category.name}</span>
            <span className="ml-2 text-xs text-neutral-400">
              /{category.slug}
            </span>
          </div>
          <div className="w-20 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {category.sort_order}
          </div>
          <div className="w-16 text-center">
            <Badge variant={category.is_active ? "default" : "secondary"}>
              {category.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        {children.map((child) => renderCategory(child, depth + 1))}
      </div>
    )
  }

  if (rootCategories.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
        No categories yet
      </div>
    )
  }

  return <>{rootCategories.map((cat) => renderCategory(cat))}</>
}
