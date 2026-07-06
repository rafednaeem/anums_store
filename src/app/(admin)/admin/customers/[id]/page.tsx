import { notFound } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/helpers"
import { ORDER_STATUS_LABELS } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Database } from "@/types/database"

export const dynamic = "force-dynamic"

type Customer = Database["public"]["Tables"]["profiles"]["Row"]
type Order = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  "id" | "order_number" | "total" | "status" | "payment_status" | "created_at"
>
type Address = Database["public"]["Tables"]["addresses"]["Row"]

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: customer, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !customer) notFound()

  const customerData = customer as Customer

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, total, status, payment_status, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false })

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", id)
    .order("is_default", { ascending: false })

  const orderList = (orders ?? []) as Order[]
  const addressList = (addresses ?? []) as Address[]
  const totalSpent = orderList.reduce(
    (sum, o) => sum + (o.total ?? 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            {customerData.full_name || "Customer"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {customerData.email}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Name</p>
                <p className="font-medium">{customerData.full_name ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Email</p>
                <p className="font-medium">{customerData.email}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Phone</p>
                <p className="font-medium">{customerData.phone ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Joined</p>
                <p className="font-medium">
                  {new Date(customerData.created_at).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Total Orders
                </p>
                <p className="text-2xl font-bold">{orderList.length}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Total Spent
                </p>
                <p className="text-2xl font-bold">{formatPrice(totalSpent)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {orderList.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No orders yet
                </p>
              ) : (
                <div className="space-y-3">
                  {orderList.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    >
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(order.created_at).toLocaleDateString("en-PK")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </Badge>
                        <span className="font-semibold">{formatPrice(order.total)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {addressList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {addressList.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {addr.label || addr.full_name}
                            {addr.is_default && (
                              <Badge variant="secondary" className="ml-2 text-[10px]">
                                Default
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {addr.address_line1}
                            {addr.address_line2 && <>, {addr.address_line2}</>}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {addr.city}, {addr.province}
                            {addr.postal_code && ` - ${addr.postal_code}`}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {addr.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
