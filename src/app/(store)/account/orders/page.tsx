"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AuthGuard from "@/components/shared/AuthGuard"
import { formatPrice } from "@/lib/helpers"
import { ORDER_STATUS_LABELS } from "@/lib/constants"

interface Order {
  id: string
  order_number: string
  created_at: string
  status: string
  total: number
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  )
}

function OrdersContent() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("orders")
        .select("id, order_number, created_at, status, total")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (data) setOrders(data)
      setLoading(false)
    }
    fetchOrders()
  }, [supabase])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-ethereal-dark">
          Account
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ethereal-dark">Orders</span>
      </div>

      <h1 className="mt-4 font-heading text-3xl font-bold text-ethereal-dark">
        Order History
      </h1>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ethereal-maroon border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-ethereal-silver/50 bg-ethereal-cream/30 py-16 text-center">
          <Package className="mb-4 h-12 w-12 text-ethereal-silver" />
          <p className="font-heading text-lg font-semibold text-ethereal-dark">
            No orders yet
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Start shopping to see your orders here.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center rounded-md bg-ethereal-dark px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ethereal-dark/90"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between rounded-lg border border-ethereal-silver/30 bg-white p-4 transition-colors hover:border-ethereal-maroon/30 hover:shadow-sm sm:p-6"
            >
              <div className="flex items-center gap-4">
                <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-ethereal-cream sm:flex">
                  <Package className="h-5 w-5 text-ethereal-dark" />
                </div>
                <div>
                  <p className="font-medium text-ethereal-dark">
                    {order.order_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="font-semibold text-ethereal-dark">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
