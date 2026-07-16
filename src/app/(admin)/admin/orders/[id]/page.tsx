import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/helpers"
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone } from "lucide-react"
import { OrderActions } from "./OrderActions"
import type { Database } from "@/types/database"

export const dynamic = "force-dynamic"

type Order = Database["public"]["Tables"]["orders"]["Row"]
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
type Payment = Database["public"]["Tables"]["payments"]["Row"]
type Timeline = Database["public"]["Tables"]["order_timeline"]["Row"]

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*),
      payments (*),
      order_timeline (*)
    `)
    .eq("id", id)
    .single()

  if (error || !order) notFound()

  const orderData = order as Order & {
    order_items: OrderItem[]
    payments: Payment[]
    order_timeline: Timeline[]
  }

  let items = (orderData.order_items ?? []) as OrderItem[]

  if (items.length === 0 && Array.isArray(orderData.items)) {
    items = (orderData.items as unknown as Array<Record<string, unknown>>).map((raw, idx) => ({
      id: `jsonb-${idx}`,
      order_id: orderData.id,
      product_id: (raw.product_id as string) || "",
      product_slug: (raw.product_slug as string) || "",
      product_name: (raw.product_name as string) || "Unknown Product",
      product_image: (raw.product_image as string) || null,
      variant_id: (raw.variant_id as string) || null,
      size: (raw.size as string) || null,
      color: (raw.color as string) || null,
      quantity: (raw.quantity as number) || 1,
      unit_price: (raw.unit_price as number) || 0,
      total_price: (raw.total_price as number) || 0,
      created_at: orderData.created_at,
    })) as OrderItem[]
  }

  const paymentList = (orderData.payments ?? []) as Payment[]
  const timelineList = ((orderData.order_timeline ?? []) as Timeline[]).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const pendingPayment = paymentList.find((p) => p.status === "submitted")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Order {orderData.order_number}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Placed on{" "}
            {new Date(orderData.created_at).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Details</CardTitle>
              <Badge variant="outline">
                {ORDER_STATUS_LABELS[orderData.status] ?? orderData.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Order Number
                  </p>
                  <p className="font-medium">{orderData.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Payment Method
                  </p>
                  <p className="font-medium capitalize">Bank Transfer</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Subtotal
                  </p>
                  <p className="font-medium">{formatPrice(orderData.subtotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Shipping
                  </p>
                  <p className="font-medium">
                    {orderData.shipping === 0 ? "Free" : formatPrice(orderData.shipping)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total
                  </p>
                  <p className="text-lg font-bold">{formatPrice(orderData.total)}</p>
                </div>
                {orderData.notes && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Notes
                    </p>
                    <p className="font-medium">{orderData.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border border-neutral-100 p-3 dark:border-neutral-800"
                  >
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-md object-cover"
                        unoptimized={item.product_image.includes("supabase")}
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800">
                        <span className="text-xs text-neutral-400">No img</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && " / "}
                        {item.color && `Color: ${item.color}`}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Qty: {item.quantity} × {formatPrice(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.total_price)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {paymentList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentList.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-lg border border-neutral-100 p-4 dark:border-neutral-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium capitalize">Bank Transfer</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {formatPrice(payment.amount)}
                        </p>
                        {payment.reference && (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Ref: {payment.reference}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          payment.status === "verified" || payment.status === "paid"
                            ? "default"
                            : payment.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                      </Badge>
                    </div>
                    {(payment.proof_url || payment.proof_filename) && (
                      <div className="mt-3">
                        <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">
                          Payment Proof:
                        </p>
                        {payment.proof_url ? (
                          <a
                            href={payment.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Image
                              src={payment.proof_url}
                              alt="Payment proof"
                              width={200}
                              height={200}
                              className="rounded-md border border-neutral-200 dark:border-neutral-800"
                              unoptimized
                            />
                          </a>
                        ) : null}
                        {payment.proof_filename && (
                          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                            {payment.proof_filename}
                          </p>
                        )}
                      </div>
                    )}
                    {payment.rejection_reason && (
                      <div className="mt-3 rounded-md bg-red-50 p-3 dark:bg-red-950">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          Rejection Reason: {payment.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Name</p>
                <p className="font-medium">
                  {orderData.customer_name} {orderData.customer_last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Phone</p>
                <a
                  href={`https://wa.me/${orderData.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-medium text-green-600 hover:underline dark:text-green-400"
                >
                  <Phone className="h-3 w-3" />
                  {orderData.phone}
                </a>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Address
                </p>
                <p className="font-medium">
                  {orderData.address}
                  <br />
                  {orderData.city}, {orderData.province}
                  {orderData.postal_code && <>, {orderData.postal_code}</>}
                </p>
              </div>
            </CardContent>
          </Card>

          <OrderActions
            orderId={orderData.id}
            currentStatus={orderData.status}
            currentPaymentStatus={orderData.payment_status}
            hasPendingPayment={!!pendingPayment}
          />

          {timelineList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timelineList.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-50" />
                        <div className="w-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium">
                          {ORDER_STATUS_LABELS[entry.status] ?? entry.status}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {entry.note}
                          </p>
                        )}
                        <p className="text-xs text-neutral-400">
                          {new Date(entry.created_at).toLocaleDateString("en-PK", {
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
