import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/helpers"
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, DollarSign, Clock, Package, Plus, FolderOpen, Users } from "lucide-react"
import type { Database } from "@/types/database"

export const dynamic = "force-dynamic"

type OrderSummary = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  | "id"
  | "order_number"
  | "customer_name"
  | "total"
  | "status"
  | "payment_status"
  | "created_at"
>
type OrderTotal = Pick<Database["public"]["Tables"]["orders"]["Row"], "total">

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  const [ordersResult, revenueResult, pendingResult, lowStockResult, recentOrdersResult] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("total")
        .eq("payment_status", "verified"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "submitted"),
      supabase
        .from("products")
        .select("id, name", { count: "exact", head: true })
        .lte("inventory_count", 5)
        .eq("is_active", true),
      supabase
        .from("orders")
        .select("id, order_number, customer_name, total, status, payment_status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  const totalOrders = ordersResult.count ?? 0
  const revenueData = (revenueResult.data ?? []) as OrderTotal[]
  const revenue = revenueData.reduce((sum, o) => sum + (o.total ?? 0), 0)
  const pendingPayments = pendingResult.count ?? 0
  const lowStockCount = lowStockResult.count ?? 0
  const recentOrders = (recentOrdersResult.data ?? []) as OrderSummary[]

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      description: "All time orders",
    },
    {
      title: "Revenue",
      value: formatPrice(revenue),
      icon: DollarSign,
      description: "Verified payments",
    },
    {
      title: "Pending Payments",
      value: pendingPayments.toString(),
      icon: Clock,
      description: "Awaiting verification",
    },
    {
      title: "Low Stock",
      value: lowStockCount.toString(),
      icon: Package,
      description: "Products with ≤5 units",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Overview of your store performance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-neutral-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link
                href="/admin/orders"
                className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No orders yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          {order.order_number}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {order.customer_name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold">
                          {formatPrice(order.total)}
                        </span>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {PAYMENT_STATUS_LABELS[order.payment_status] ??
                              order.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <Plus className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-medium">View Orders</span>
              </Link>
              <Link
                href="/admin/products/new"
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <FolderOpen className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-medium">Add Product</span>
              </Link>
              <Link
                href="/admin/customers"
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <Users className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-medium">View Customers</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
