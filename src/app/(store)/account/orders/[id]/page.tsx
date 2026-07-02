"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AuthGuard from "@/components/shared/AuthGuard"
import { formatPrice } from "@/lib/helpers"
import { ORDER_STATUS_LABELS } from "@/lib/constants"

interface OrderItem {
  product_name: string
  product_image: string | null
  size: string | null
  color: string | null
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  order_number: string
  created_at: string
  status: string
  payment_method: string
  payment_status: string
  customer_name: string
  customer_last_name: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string | null
  notes: string | null
  subtotal: number
  shipping: number
  total: number
  items: OrderItem[]
}

export default function OrderDetailPage() {
  return (
    <AuthGuard>
      <OrderDetailContent />
    </AuthGuard>
  )
}

function OrderDetailContent() {
  const params = useParams()
  const supabase = createClient()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single()

      if (!error && data) {
        setOrder({
          ...data,
          items: Array.isArray(data.items) ? (data.items as unknown as OrderItem[]) : [],
        })
      }
      setLoading(false)
    }
    fetchOrder()
  }, [params.id, supabase])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-ethereal-dark">
          Account
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/account/orders" className="hover:text-ethereal-dark">
          Orders
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ethereal-dark">
          {order?.order_number || "..."}
        </span>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ethereal-maroon border-t-transparent" />
        </div>
      ) : !order ? (
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-ethereal-dark">
            Order not found
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-ethereal-dark">
                Order {order.order_number}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-PK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium text-ethereal-dark">
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          {/* Order Items */}
          <div className="mt-8 rounded-lg border border-ethereal-silver/30 bg-white">
            <div className="border-b border-ethereal-silver/30 px-6 py-4">
              <h2 className="font-heading text-lg font-bold text-ethereal-dark">
                Items
              </h2>
            </div>
            <div className="divide-y divide-ethereal-silver/20">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 px-6 py-4">
                  {item.product_image && (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-ethereal-cream">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-ethereal-dark">
                      {item.product_name}
                    </p>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-ethereal-dark">
                      {formatPrice(item.total_price)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.unit_price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-ethereal-silver/30 px-6 py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="border-t border-ethereal-silver/30 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-ethereal-dark">Total</span>
                  <span className="font-heading text-lg font-bold text-ethereal-dark">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Details */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-ethereal-silver/30 bg-white p-6">
              <h3 className="font-heading text-sm font-bold text-ethereal-dark">
                Shipping Address
              </h3>
              <div className="mt-3 text-sm text-muted-foreground">
                <p className="font-medium text-ethereal-dark">
                  {order.customer_name} {order.customer_last_name}
                </p>
                <p>{order.phone}</p>
                <p>{order.address}</p>
                <p>
                  {order.city}, {order.province}
                  {order.postal_code && ` ${order.postal_code}`}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-ethereal-silver/30 bg-white p-6">
              <h3 className="font-heading text-sm font-bold text-ethereal-dark">
                Payment Details
              </h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="capitalize">
                    {order.payment_method === "cod"
                      ? "Cash on Delivery"
                      : "Bank Transfer"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="capitalize">
                    {order.payment_status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-6 rounded-lg border border-ethereal-silver/30 bg-white p-6">
              <h3 className="font-heading text-sm font-bold text-ethereal-dark">
                Order Notes
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
