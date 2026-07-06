import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { InventoryRow } from "./InventoryRow"

export const dynamic = "force-dynamic"

export default async function InventoryPage() {
  const supabase = createAdminClient()

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, size, color, color_hex, sku, inventory_count, is_active, product_id, products(name, cover_url)")
    .eq("is_active", true)
    .order("inventory_count", { ascending: true })

  type VariantRow = {
    id: string
    size: string
    color: string
    color_hex: string | null
    sku: string | null
    inventory_count: number
    is_active: boolean
    product_id: string
    products: { name: string; cover_url: string | null } | null
  }

  const rows = (variants ?? []) as VariantRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Inventory
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Track and manage stock levels
        </p>
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
                    Variant
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-neutral-500 dark:text-neutral-400">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  rows.map((variant) => (
                    <InventoryRow key={variant.id} variant={variant} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
