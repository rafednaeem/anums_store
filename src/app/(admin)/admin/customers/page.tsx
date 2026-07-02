import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/helpers"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function CustomersPage() {
  const supabase = createAdminClient()

  const { data: customers } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false })

  const customerIds = customers?.map((c) => c.id) ?? []

  const { data: orderStats } = customerIds.length > 0
    ? await supabase
        .from("orders")
        .select("user_id, total")
        .in("user_id", customerIds)
    : { data: [] }

  const statsMap = new Map<string, { count: number; total: number }>()
  orderStats?.forEach((o) => {
    if (!o.user_id) return
    const existing = statsMap.get(o.user_id) ?? { count: 0, total: 0 }
    existing.count++
    existing.total += o.total ?? 0
    statsMap.set(o.user_id, existing)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Customers
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          All registered customers
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-neutral-500 dark:text-neutral-400">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
                    Total Spent
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {!customers || customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => {
                    const stat = statsMap.get(customer.id) ?? { count: 0, total: 0 }
                    return (
                      <tr
                        key={customer.id}
                        className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/50"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="font-medium hover:underline"
                          >
                            {customer.full_name || "N/A"}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                          {customer.email}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                          {customer.phone ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-center">{stat.count}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatPrice(stat.total)}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                          {new Date(customer.created_at).toLocaleDateString("en-PK")}
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
