import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/helpers"
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import type { Database } from "@/types/database"

export const dynamic = "force-dynamic"

type OrderRow = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  | "id"
  | "order_number"
  | "customer_name"
  | "customer_last_name"
  | "phone"
  | "total"
  | "status"
  | "payment_status"
  | "items"
  | "created_at"
>

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string
    payment_status?: string
    q?: string
  }>
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams
  const supabase = createAdminClient()

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_last_name, phone, total, status, payment_status, items, created_at"
    )

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status)
  }
  if (params.payment_status && params.payment_status !== "all") {
    query = query.eq("payment_status", params.payment_status)
  }
  if (params.q) {
    query = query.or(`customer_name.ilike.%${params.q}%,phone.ilike.%${params.q}%`)
  }

  query = query.order("created_at", { ascending: false })

  const { data: orders } = await query
  const orderList = (orders ?? []) as OrderRow[]

  const filters = {
    status: params.status ?? "all",
    payment_status: params.payment_status ?? "all",
    q: params.q ?? "",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Orders
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Manage all customer orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-neutral-400" />
              <Input
                name="q"
                placeholder="Search by name or phone..."
                defaultValue={filters.q}
                className="w-64"
              />
            </div>

            <Select name="status" defaultValue={filters.status}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              name="payment_status"
              defaultValue={filters.payment_status}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Apply
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-neutral-500 dark:text-neutral-400">
                    Items
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-neutral-500 dark:text-neutral-400">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-neutral-500 dark:text-neutral-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orderList.map((order) => {
                    const items = (order.items ?? []) as Array<{ quantity?: number }>
                    const itemCount = items.reduce(
                      (sum, item) => sum + (item.quantity ?? 1),
                      0
                    )
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/50"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium text-neutral-900 hover:underline dark:text-neutral-50"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            {order.customer_name} {order.customer_last_name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {order.phone}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">{itemCount}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={
                              order.payment_status === "verified" ||
                              order.payment_status === "paid"
                                ? "default"
                                : order.payment_status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {PAYMENT_STATUS_LABELS[order.payment_status] ??
                              order.payment_status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline">
                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                          {new Date(order.created_at).toLocaleDateString("en-PK")}
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
