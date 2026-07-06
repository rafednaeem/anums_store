import Link from "next/link"
import Image from "next/image"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/helpers"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DeleteProductButton } from "@/components/admin/DeleteProductButton"
import type { Database } from "@/types/database"

export const dynamic = "force-dynamic"

type Product = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "name" | "slug" | "price" | "inventory_count" | "is_active" | "cover_url" | "category_id"
>
type Category = Pick<Database["public"]["Tables"]["categories"]["Row"], "name">

export default async function ProductsPage() {
  const supabase = createAdminClient()

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, inventory_count, is_active, cover_url, category_id, categories(name)")
    .order("created_at", { ascending: false })

  const productList = (products ?? []) as Array<Product & { categories: Category | Category[] | null }>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Products
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your product catalog
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
                    Price
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-neutral-500 dark:text-neutral-400">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-neutral-500 dark:text-neutral-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {productList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  productList.map((product) => {
                    const catRaw = product.categories
                    const cat = Array.isArray(catRaw)
                      ? (catRaw[0] as Category | undefined) ?? null
                      : catRaw
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.cover_url ? (
                              <Image
                                src={product.cover_url}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-md object-cover"
                                unoptimized={product.cover_url.includes("supabase")}
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800">
                                <span className="text-xs text-neutral-400">-</span>
                              </div>
                            )}
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                          {cat?.name ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={
                              product.inventory_count <= 5
                                ? "font-medium text-red-600 dark:text-red-400"
                                : ""
                            }
                          >
                            {product.inventory_count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-50"
                            >
                              Edit
                            </Link>
                            <DeleteProductButton id={product.id} name={product.name} />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
