import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import type { OrderRecord } from "@/lib/orders";
import OrderStatusBadge from "../OrderStatusBadge";
import StatusUpdateForm from "./StatusUpdateForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  if (!isAdminConfigured) {
    return (
      <div className="p-8 text-center text-foreground/65">
        Admin database client is not configured.
      </div>
    );
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !order) {
    return (
      <div className="p-8 text-center text-red-500">
        Order not found: {error?.message ?? "Unknown error"}
      </div>
    );
  }

  const o = order as OrderRecord;

  return (
    <div className="p-6">
      <Link
        href="/admin/orders"
        className="mb-4 flex items-center gap-1 text-sm font-bold text-ethereal-lavender transition-colors hover:text-ethereal-blush"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ethereal-blush">
          Order Detail
        </p>
        <h1 className="text-3xl font-heading text-ethereal-lavender">
          #{o.id.slice(0, 8)}
        </h1>
        <p className="mt-1 text-sm text-foreground/65">
          Placed on{" "}
          {new Date(o.created_at).toLocaleDateString("en-PK", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-heading text-ethereal-lavender">Items</h2>
            <div className="space-y-3">
              {o.items.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/product/${item.id}`}
                      className="font-bold text-foreground transition-colors hover:text-ethereal-blush"
                    >
                      {item.name}
                    </Link>
                    {item.size && (
                      <span className="ml-2 text-xs text-foreground/50">
                        Size: {item.size}
                      </span>
                    )}
                    <p className="text-sm text-foreground/65">
                      Qty: {item.quantity} &times; Rs. {item.price.toLocaleString()}
                    </p>
                  </div>
                  <p className="font-bold text-ethereal-blush">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/65">Subtotal</span>
                <span>Rs. {o.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/65">Shipping</span>
                <span>
                  {o.shipping === 0 ? "Free" : `Rs. ${o.shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-ethereal-blush">
                  Rs. {o.total.toLocaleString()}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-heading text-ethereal-lavender">Customer</h2>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-bold">Name:</span> {o.customer_name}{" "}
                {o.customer_last_name}
              </p>
              <p>
                <span className="font-bold">Phone:</span>{" "}
                <a
                  href={`https://wa.me/${o.phone.replace(/^0/, "92")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ethereal-lavender underline underline-offset-2 hover:text-ethereal-blush"
                >
                  {o.phone}
                </a>
              </p>
              <p>
                <span className="font-bold">Address:</span> {o.address}
              </p>
              <p>
                <span className="font-bold">City:</span> {o.city}
                {o.postal_code ? `, ${o.postal_code}` : ""}
              </p>
            </div>
          </section>

          <section className="border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-heading text-ethereal-lavender">Payment</h2>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-bold">Method:</span> {o.payment_method}
              </p>
              <p>
                <span className="font-bold">Status:</span>{" "}
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                    o.payment_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : o.payment_status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {o.payment_status}
                </span>
              </p>
            </div>
          </section>

          <section className="border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-heading text-ethereal-lavender">Status</h2>
            <div className="mb-4">
              <OrderStatusBadge status={o.status} />
            </div>
            <StatusUpdateForm orderId={o.id} currentStatus={o.status} />
          </section>
        </div>
      </div>
    </div>
  );
}
