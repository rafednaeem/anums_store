"use server";

import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import { sanityWriteClient, isSanityWriteConfigured } from "@/lib/sanity-admin";
import type { OrderRecord } from "@/lib/orders";
import { revalidatePath } from "next/cache";

const VALID_STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"];

async function adjustStock(order: OrderRecord, direction: "decrement" | "increment") {
  if (!isSanityWriteConfigured) return;
  const multiplier = direction === "decrement" ? -1 : 1;

  for (const item of order.items) {
    const slug = item.id;
    const qty = item.quantity;

    const current = await sanityWriteClient.fetch<{ quantity: number } | null>(
      `*[_type == "product" && slug.current == $slug][0]{quantity}`,
      { slug },
    );

    if (current === null) continue;

    const newQty = Math.max(0, (current.quantity ?? 0) + multiplier * qty);

    await sanityWriteClient
      .patch({ query: `*[_type == "product" && slug.current == $slug]` })
      .set({ quantity: newQty, inStock: newQty > 0 })
      .commit();
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!isAdminConfigured) {
    return { error: "Admin database client not configured" };
  }

  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order) {
    return { error: "Order not found" };
  }

  const prevStatus = order.status;

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    return { error: error.message };
  }

  if (status === "confirmed" && prevStatus !== "confirmed") {
    await adjustStock(order as OrderRecord, "decrement");
  }

  if (status === "cancelled" && prevStatus === "confirmed") {
    await adjustStock(order as OrderRecord, "increment");
  }

  revalidatePath("/admin/orders");
  return { success: true };
}
