import { Suspense } from "react"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { formatPrice } from "@/lib/helpers"
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, whatsappNumber } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your order has been placed successfully.",
}

interface OrderRecord {
  id: string
  order_number: string
  user_id: string | null
  guest_email: string | null
  customer_name: string
  address: string
  city: string
  province: string
  postal_code: string | null
  payment_method: string
  status: string
  subtotal: number
  shipping: number
  total: number
  order_items: OrderItemRecord[]
  payments: PaymentRecord[]
  order_timeline: TimelineRecord[]
}

interface OrderItemRecord {
  id: string
  product_name: string
  size: string | null
  color: string | null
  quantity: number
  total_price: number
}

interface PaymentRecord {
  id: string
  status: string
  proof_url: string | null
}

interface TimelineRecord {
  id: string
  status: string
  note: string | null
  created_at: string
}

async function OrderDetails({ orderId, token }: { orderId: string; token?: string }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let order: OrderRecord | null = null

  if (user) {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*),
        payments (*),
        order_timeline (*)
      `)
      .eq("id", orderId)
      .single()

    if (!error && data) {
      const orderData = data as unknown as OrderRecord
      if (orderData.user_id && orderData.user_id !== user.id) {
        return (
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold text-ethereal-dark">
              Access Denied
            </h1>
            <p className="mt-3 text-muted-foreground">
              You don&apos;t have permission to view this order.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center rounded-md bg-ethereal-dark px-6 py-3 text-sm font-medium text-white hover:bg-ethereal-dark/90"
            >
              Continue Shopping
            </Link>
          </div>
        )
      }
      order = orderData
    }
  } else if (token) {
    const serviceRole = createServiceRoleClient()

    const { data, error } = await serviceRole
      .from("orders")
      .select(`
        *,
        order_items (*),
        payments (*),
        order_timeline (*)
      `)
      .eq("id", orderId)
      .eq("guest_access_token", token)
      .single()

    if (!error && data) {
      order = data as unknown as OrderRecord
    }
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-ethereal-dark">
          Order Not Found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center rounded-md bg-ethereal-dark px-6 py-3 text-sm font-medium text-white hover:bg-ethereal-dark/90"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  const payment = order.payments?.[0]
  const timeline = (order.order_timeline || []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hi%2C%20I%27d%20like%20to%20track%20my%20order%20${encodeURIComponent(order.order_number)}`

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-ethereal-silver/30 bg-white p-6 sm:p-8">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-ethereal-dark">
            Order Confirmed
          </h1>
          <p className="mt-2 text-muted-foreground">
            Order #{order.order_number}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant="secondary">
              {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
            </Badge>
            <Badge variant="outline">
              {payment ? (PAYMENT_STATUS_LABELS[payment.status as keyof typeof PAYMENT_STATUS_LABELS] || payment.status) : "Pending"}
            </Badge>
          </div>
        </div>

        <div className="mt-8 divide-y divide-ethereal-silver/20">
          <div className="pb-4">
            <h2 className="text-sm font-semibold text-ethereal-dark">Items</h2>
            <div className="mt-2 space-y-2">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.product_name}</span>
                    {item.size && <span className="text-muted-foreground"> - {item.size}</span>}
                    {item.color && <span className="text-muted-foreground"> - {item.color}</span>}
                    <span className="text-muted-foreground"> x{item.quantity}</span>
                  </div>
                  <span className="font-medium">{formatPrice(item.total_price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="py-4">
            <h2 className="text-sm font-semibold text-ethereal-dark">Shipping</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.customer_name}<br />
              {order.address}<br />
              {order.city}, {order.province}
              {order.postal_code && <> {order.postal_code}</>}
            </p>
          </div>

          <div className="py-4">
            <h2 className="text-sm font-semibold text-ethereal-dark">Payment</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Method: Bank Transfer
            </p>
            {payment?.proof_url && (
              <a
                href={payment.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-ethereal-maroon hover:underline"
              >
                View Payment Proof
              </a>
            )}
          </div>

          <div className="pt-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Shipping</span>
              <span className="text-sm">{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-ethereal-silver/30 pt-2">
              <span className="font-semibold text-ethereal-dark">Total</span>
              <span className="font-heading text-lg font-bold text-ethereal-dark">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {timeline.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-ethereal-dark">Order Timeline</h2>
            <div className="mt-2 space-y-2">
              {timeline.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-ethereal-maroon" />
                  <div>
                    <p className="font-medium">
                      {ORDER_STATUS_LABELS[entry.status as keyof typeof ORDER_STATUS_LABELS] || entry.status}
                    </p>
                    {entry.note && (
                      <p className="text-muted-foreground">{entry.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full sm:w-auto">
              Track on WhatsApp
            </Button>
          </a>
          <Link href="/shop">
            <Button className="w-full bg-ethereal-dark text-white hover:bg-ethereal-dark/90 sm:w-auto">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function OrderConfirmationFallback() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ethereal-maroon border-t-transparent" />
      </div>
    </div>
  )
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>
}) {
  const { id, token } = await searchParams

  if (!id) {
    redirect("/shop")
  }

  return (
    <Suspense fallback={<OrderConfirmationFallback />}>
      <OrderDetails orderId={id} token={token} />
    </Suspense>
  )
}
