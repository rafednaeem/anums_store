"use server"

import { revalidatePath } from "next/cache"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { requireAdminThrow } from "@/lib/supabase/admin"
import type { ProductInput } from "@/lib/validations"
import type { Database } from "@/types/database"

type Tables = Database["public"]["Tables"]

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() } as Tables["orders"]["Update"])
    .eq("id", orderId)

  if (error) throw new Error(error.message)

  const user = (await supabase.auth.getUser()).data.user

  await supabase.from("order_timeline").insert({
    order_id: orderId,
    status,
    created_by: user?.id,
  } as Tables["order_timeline"]["Insert"])

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}

export async function verifyPayment(orderId: string) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient()

  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .eq("status", "submitted")
    .single()

  if (payErr || !payment) throw new Error("No pending payment found")

  const user = (await supabase.auth.getUser()).data.user

  const { error } = await supabase
    .from("payments")
    .update({
      status: "verified",
      verified_by: user?.id ?? null,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Tables["payments"]["Update"])
    .eq("id", (payment as { id: string }).id)

  if (error) throw new Error(error.message)

  await supabase
    .from("orders")
    .update({ payment_status: "verified", updated_at: new Date().toISOString() } as Tables["orders"]["Update"])
    .eq("id", orderId)

  await supabase.from("order_timeline").insert({
    order_id: orderId,
    status: "payment_verified",
    note: "Payment verified by admin",
    created_by: user?.id,
  } as Tables["order_timeline"]["Insert"])

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}

export async function rejectPayment(orderId: string, reason: string) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient()

  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .eq("status", "submitted")
    .single()

  if (payErr || !payment) throw new Error("No pending payment found")

  const user = (await supabase.auth.getUser()).data.user

  const { error } = await supabase
    .from("payments")
    .update({
      status: "rejected",
      rejection_reason: reason,
      verified_by: user?.id ?? null,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Tables["payments"]["Update"])
    .eq("id", (payment as { id: string }).id)

  if (error) throw new Error(error.message)

  await supabase
    .from("orders")
    .update({ payment_status: "rejected", updated_at: new Date().toISOString() } as Tables["orders"]["Update"])
    .eq("id", orderId)

  await supabase.from("order_timeline").insert({
    order_id: orderId,
    status: "payment_rejected",
    note: reason,
    created_by: user?.id,
  } as Tables["order_timeline"]["Insert"])

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function createProduct(data: ProductInput) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient()

  const slug = data.slug || slugify(data.name)

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: data.name,
      slug,
      description: data.description || null,
      category_id: data.category_id || null,
      price: data.price,
      compare_price: data.compare_price ?? null,
      sale_price: data.sale_price ?? null,
      is_on_sale: !!data.sale_price,
      is_active: data.is_active ?? true,
      inventory_count: data.inventory_count ?? 0,
      craft_type: data.craft_type || null,
      cover_url: data.cover_url || null,
      catalog_url: data.catalog_url || null,
    } as Tables["products"]["Insert"])
    .select("id")
    .single()

  if (error) throw new Error(error.message)

  const productId = (product as { id: string }).id

  if (data.gallery_urls && data.gallery_urls.length > 0) {
    const images = data.gallery_urls.map((url, i) => ({
      product_id: productId,
      image_url: url,
      sort_order: i,
      is_primary: i === 0,
    }))
    await supabase.from("product_images").insert(images as Tables["product_images"]["Insert"][])
  }

  if (data.colors && data.colors.length > 0 && data.sizes && data.sizes.length > 0) {
    const variants = data.colors.flatMap((color) =>
      data.sizes!.map((size) => ({
        product_id: productId,
        size,
        color: color.name,
        color_hex: color.hex,
        inventory_count: 0,
        is_active: true,
      }))
    )
    await supabase.from("product_variants").insert(variants as Tables["product_variants"]["Insert"][])
  } else if (data.sizes && data.sizes.length > 0) {
    const variants = data.sizes.map((size) => ({
      product_id: productId,
      size,
      color: "Default",
      color_hex: null,
      inventory_count: 0,
      is_active: true,
    }))
    await supabase.from("product_variants").insert(variants as Tables["product_variants"]["Insert"][])
  } else if (data.colors && data.colors.length > 0) {
    const variants = data.colors.map((color) => ({
      product_id: productId,
      size: "Default",
      color: color.name,
      color_hex: color.hex,
      inventory_count: 0,
      is_active: true,
    }))
    await supabase.from("product_variants").insert(variants as Tables["product_variants"]["Insert"][])
  }

  revalidatePath("/admin/products")
  return productId
}

export async function updateProduct(id: string, data: ProductInput) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient()

  const slug = data.slug || slugify(data.name)

  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      slug,
      description: data.description || null,
      category_id: data.category_id || null,
      price: data.price,
      compare_price: data.compare_price ?? null,
      sale_price: data.sale_price ?? null,
      is_on_sale: !!data.sale_price,
      is_active: data.is_active ?? true,
      inventory_count: data.inventory_count ?? 0,
      craft_type: data.craft_type || null,
      cover_url: data.cover_url || null,
      catalog_url: data.catalog_url || null,
      updated_at: new Date().toISOString(),
    } as Tables["products"]["Update"])
    .eq("id", id)

  if (error) throw new Error(error.message)

  if (data.gallery_urls) {
    await supabase.from("product_images").delete().eq("product_id", id)
    if (data.gallery_urls.length > 0) {
      const images = data.gallery_urls.map((url, i) => ({
        product_id: id,
        image_url: url,
        sort_order: i,
        is_primary: i === 0,
      }))
      await supabase.from("product_images").insert(images as Tables["product_images"]["Insert"][])
    }
  }

  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${id}/edit`)
}

export async function deleteProduct(id: string) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient()

  await supabase.from("product_images").delete().eq("product_id", id)
  await supabase.from("product_variants").delete().eq("product_id", id)

  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/admin/products")
}

export async function updateReviewStatus(reviewId: string, status: string) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from("reviews")
    .update({ status } as Tables["reviews"]["Update"])
    .eq("id", reviewId)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/reviews")
}

export async function updateInquiryStatus(inquiryId: string, status: string) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from("inquiries")
    .update({ status } as Tables["inquiries"]["Update"])
    .eq("id", inquiryId)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/inquiries")
}

export async function updateSettings(settings: Record<string, string>) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient()

  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from("site_settings")
    .upsert(rows as Tables["site_settings"]["Insert"][], { onConflict: "key" })

  if (error) throw new Error(error.message)
  revalidatePath("/admin/settings")
}

export async function updateCategory(
  id: string | null,
  data: { name: string; slug?: string; parent_id?: string | null; sort_order?: number; is_active?: boolean }
) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient()

  if (id) {
    const { error } = await supabase
      .from("categories")
      .update({ ...data, updated_at: new Date().toISOString() } as Tables["categories"]["Update"])
      .eq("id", id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from("categories").insert({
      name: data.name,
      slug: data.slug || slugify(data.name),
      parent_id: data.parent_id ?? null,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
    } as Tables["categories"]["Insert"])
    if (error) throw new Error(error.message)
  }

  revalidatePath("/admin/categories")
}

export async function deleteCategory(id: string) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient()

  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/categories")
}

export async function updateInventory(variantId: string, inventoryCount: number) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from("product_variants")
    .update({ inventory_count: inventoryCount } as Tables["product_variants"]["Update"])
    .eq("id", variantId)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/inventory")
}
