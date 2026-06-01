"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { OrderRecord } from "@/lib/orders";
import BulkStatusBar from "./BulkStatusBar";
import OrderStatusBadge from "./OrderStatusBadge";

function matchesOrder(order: OrderRecord, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [order.customer_name, order.customer_last_name, order.phone]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

export default function OrderSearch({ orders }: { orders: OrderRecord[] }) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => matchesOrder(order, query)),
    [orders, query],
  );

  const toggleOrder = (orderId: string) => {
    setSelectedIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId],
    );
  };

  const allVisibleSelected =
    filteredOrders.length > 0 && filteredOrders.every((order) => selectedIds.includes(order.id));

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !filteredOrders.some((order) => order.id === id)));
      return;
    }
    setSelectedIds((current) => Array.from(new Set([...current, ...filteredOrders.map((order) => order.id)])));
  };

  return (
    <>
      <div className="mb-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search customer name or phone"
          className="w-full max-w-md border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-ethereal-blush"
        />
      </div>

      <BulkStatusBar selectedIds={selectedIds} onCancel={() => setSelectedIds([])} />

      {filteredOrders.length === 0 ? (
        <p className="py-12 text-center text-foreground/65">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-foreground/50">
                <th className="py-3 pr-4">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    className="h-4 w-4 accent-ethereal-maroon"
                    aria-label="Select visible orders"
                  />
                </th>
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Items</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 transition-colors hover:bg-ethereal-blush/5"
                >
                  <td className="py-3 pr-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleOrder(order.id)}
                      className="h-4 w-4 accent-ethereal-maroon"
                      aria-label={`Select order ${order.id.slice(0, 8)}`}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-xs font-bold text-ethereal-lavender underline underline-offset-2 hover:text-ethereal-blush"
                    >
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-foreground">
                      {order.customer_name} {order.customer_last_name}
                    </div>
                    <div className="text-xs text-foreground/50">{order.phone}</div>
                  </td>
                  <td className="py-3 pr-4 text-foreground/65">{order.items.length}</td>
                  <td className="py-3 pr-4 font-bold text-ethereal-blush">
                    Rs. {order.total.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : order.payment_status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-xs text-foreground/50">
                    {new Date(order.created_at).toLocaleDateString("en-PK", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
