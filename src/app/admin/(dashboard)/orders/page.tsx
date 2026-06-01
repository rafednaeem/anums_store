import { Suspense } from "react";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import type { OrderRecord } from "@/lib/orders";
import OrderFilters from "./OrderFilters";
import OrderSearch from "./OrderSearch";


export const dynamic = "force-dynamic";

const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_STATUSES = ["pending", "paid", "failed"] as const;

interface PageProps {
  searchParams: { status?: string; payment_status?: string };
}

function normalizeOrder(order: OrderRecord & { order_items?: Array<{
  id: string;
  product_slug: string | null;
  product_name: string;
  product_image: string | null;
  size: string | null;
  quantity: number;
  unit_price: number;
}> }) {
  if (!order.order_items || order.order_items.length === 0) return order;
  return {
    ...order,
    items: order.order_items.map((item) => ({
      id: item.product_slug || item.id,
      name: item.product_name,
      price: Number(item.unit_price),
      quantity: item.quantity,
      image: item.product_image || "",
      size: item.size || "Default",
    })),
  };
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  if (!isAdminConfigured) {
    return (
      <div className="p-8 text-center text-foreground/65">
        Admin database client is not configured. Set <code>SUPABASE_SERVICE_ROLE_KEY</code> in your environment.
      </div>
    );
  }

  const status = typeof searchParams.status === "string" ? searchParams.status : "";
  const paymentStatus = typeof searchParams.payment_status === "string" ? searchParams.payment_status : "";

  let query = supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  const { data: allOrders } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (status && (STATUSES as ReadonlyArray<string>).includes(status)) {
    query = query.eq("status", status);
  }
  if (paymentStatus && (PAYMENT_STATUSES as ReadonlyArray<string>).includes(paymentStatus)) {
    query = query.eq("payment_status", paymentStatus);
  }

  const { data: orders, error } = await query;

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load orders: {error.message}
      </div>
    );
  }

  const kpiOrders = ((allOrders ?? []) as Array<OrderRecord & { order_items?: never[] }>).map(normalizeOrder);
  const revenue = kpiOrders
    .filter((order) => order.payment_status === "paid")
    .reduce((total, order) => total + Number(order.total || 0), 0);
  const kpis = [
    { label: "Total Orders", value: kpiOrders.length.toLocaleString() },
    { label: "New Orders", value: kpiOrders.filter((order) => order.status === "new").length.toLocaleString() },
    { label: "Revenue", value: `Rs. ${revenue.toLocaleString()}` },
    { label: "Pending", value: kpiOrders.filter((order) => order.payment_status === "pending").length.toLocaleString() },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ethereal-blush">Operations</p>
        <h1 className="text-3xl font-heading text-ethereal-lavender">Orders</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="border border-ethereal-silver/40 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/45">
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      <Suspense fallback={<div className="h-10 animate-pulse bg-gray-100 rounded mb-6"></div>}>
        <OrderFilters currentStatus={status} currentPaymentStatus={paymentStatus} />
      </Suspense>
      <OrderSearch orders={((orders ?? []) as Array<OrderRecord & { order_items?: never[] }>).map(normalizeOrder)} />
    </div>
  );
}
