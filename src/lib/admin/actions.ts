"use server"

import { revalidatePath } from "next/cache"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { requireAdminThrow } from "@/lib/supabase/admin"
import type { ProductInput } from "@/lib/validations"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

type ActionResult = { ok: true; id?: string } | { ok: false; error: string }

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function generateUniqueSlug(supabase: Any, baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug
  let suffix = 1
  
  while (true) {
    let query = supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
    
    if (excludeId) {
      query = query.neq("id", excludeId)
    }
    
    const { data: existing } = await query.single()
    
    if (!existing) break
    slug = `${baseSlug}-${suffix}`
    suffix++
  }
  
  return slug
}

export async function updateOrderStatus(orderId: string, status: string): Promise<ActionResult> {
  try {
    const admin = await requireAdminThrow()
    const supabase = createServiceRoleClient() as Any

    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)

    if (error) return { ok: false, error: `Failed to update order: ${error.message}` }

    await supabase.from("order_timeline").insert({
      order_id: orderId,
      status,
      note: `Status changed to ${status}`,
      created_by: admin.id ?? null,
    })

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[updateOrderStatus] Error:", msg)
    return { ok: false, error: msg }
  }
}

export async function verifyPayment(orderId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdminThrow()
    const supabase = createServiceRoleClient() as Any

    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .select("id")
      .eq("order_id", orderId)
      .eq("status", "submitted")
      .single()

    if (payErr || !payment) return { ok: false, error: `No pending payment found: ${payErr?.message ?? "unknown"}` }

    const { error } = await supabase
      .from("payments")
      .update({
        status: "verified",
        verified_by: admin.id ?? null,
        verified_at: new Date().toISOString(),
      })
      .eq("id", (payment as { id: string }).id)

    if (error) return { ok: false, error: `Failed to update payment: ${error.message}` }

    await supabase
      .from("orders")
      .update({
        payment_status: "verified",
        status: "payment_verified",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    await supabase.from("order_timeline").insert({
      order_id: orderId,
      status: "payment_verified",
      note: "Payment verified by admin",
      created_by: admin.id ?? null,
    })

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[verifyPayment] Error:", msg)
    return { ok: false, error: msg }
  }
}

export async function rejectPayment(orderId: string, reason: string): Promise<ActionResult> {
  try {
    const admin = await requireAdminThrow()
    const supabase = createServiceRoleClient() as Any

    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .select("id")
      .eq("order_id", orderId)
      .eq("status", "submitted")
      .single()

    if (payErr || !payment) return { ok: false, error: `No pending payment found: ${payErr?.message ?? "unknown"}` }

    const { error } = await supabase
      .from("payments")
      .update({
        status: "rejected",
        rejection_reason: reason,
        verified_by: admin.id ?? null,
        verified_at: new Date().toISOString(),
      })
      .eq("id", (payment as { id: string }).id)

    if (error) return { ok: false, error: `Failed to update payment: ${error.message}` }

    await supabase
      .from("orders")
      .update({
        payment_status: "rejected",
        status: "payment_rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    await supabase.from("order_timeline").insert({
      order_id: orderId,
      status: "payment_rejected",
      note: reason,
      created_by: admin.id ?? null,
    })

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[rejectPayment] Error:", msg)
    return { ok: false, error: msg }
  }
}

export async function createProduct(data: ProductInput) {
  try {
    await requireAdminThrow()
    const supabase = createServiceRoleClient() as Any

    const baseSlug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name)
    if (!baseSlug) {
      throw new Error("Invalid product name: unable to generate slug")
    }
    
    const slug = await generateUniqueSlug(supabase, baseSlug)

    const insertData = {
      name: data.name,
      slug,
      description: data.description || null,
      category_id: data.category_id || null,
      price: Math.round(Number(data.price) || 0),
      sale_price: data.sale_price != null ? Math.round(Number(data.sale_price)) : null,
      is_on_sale: data.is_on_sale ?? false,
      is_active: data.is_active ?? true,
      is_featured: data.is_featured ?? false,
      inventory_count: Math.round(Number(data.inventory_count) || 0),
      craft_type: data.craft_type || null,
      cover_url: data.cover_url || null,
    }

    console.log("[createProduct] Inserting product:", { ...insertData, slug })

    const { data: product, error } = await supabase
      .from("products")
      .insert(insertData)
      .select("id")
      .single()

    if (error) {
      console.error("[createProduct] Database error:", error)
      console.error("[createProduct] Insert payload:", JSON.stringify(insertData))
      throw new Error(`Database error: ${error.message}`)
    }

    const productId = (product as { id: string }).id

    const galleryImages: string[] = data.gallery_urls ?? []
    if (galleryImages.length === 0 && data.cover_url) {
      galleryImages.push(data.cover_url)
    }

    if (galleryImages.length > 0) {
      const images = galleryImages.map((url, i) => ({
        product_id: productId,
        image_url: url,
        sort_order: i,
        is_primary: i === 0,
      }))
      const { error: imgError } = await supabase
        .from("product_images")
        .insert(images)
      if (imgError) {
        console.error("[createProduct] Image insert error:", imgError)
        throw new Error(imgError.message)
      }
    }

    const sizes = (data.sizes ?? []).filter((s) => s && s !== "Default")
    const colors = (data.colors ?? []).filter((c) => c && c.name)

    let variantsToInsert: {
      product_id: string
      size: string
      color: string
      color_hex: string | null
      inventory_count: number
      is_active: boolean
    }[] = []

    if (sizes.length > 0 && colors.length > 0) {
      const seen = new Set<string>()
      variantsToInsert = sizes.flatMap((size) =>
        colors.map((color) => {
          const key = `${size}-${color.name}`
          if (seen.has(key)) return null
          seen.add(key)
          return {
            product_id: productId,
            size,
            color: color.name,
            color_hex: color.hex,
            inventory_count: 0,
            is_active: true,
          }
        })
      ).filter(Boolean) as Any
    } else if (sizes.length > 0) {
      const seen = new Set<string>()
      variantsToInsert = sizes.map((size) => {
        if (seen.has(size)) return null
        seen.add(size)
        return {
          product_id: productId,
          size,
          color: "Default",
          color_hex: null,
          inventory_count: 0,
          is_active: true,
        }
      }).filter(Boolean) as Any
    } else if (colors.length > 0) {
      const seen = new Set<string>()
      variantsToInsert = colors.map((color) => {
        if (seen.has(color.name)) return null
        seen.add(color.name)
        return {
          product_id: productId,
          size: "Default",
          color: color.name,
          color_hex: color.hex,
          inventory_count: 0,
          is_active: true,
        }
      }).filter(Boolean) as Any
    }

    if (variantsToInsert.length > 0) {
      const { error: varError } = await supabase
        .from("product_variants")
        .insert(variantsToInsert)
      if (varError) {
        console.error("[createProduct] Variant insert error:", varError)
        throw new Error(varError.message)
      }
    }

    revalidatePath("/admin/products")
    revalidatePath("/")
    return { ok: true, id: productId }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error creating product"
    console.error("[createProduct] Exception:", err)
    return { ok: false, error: message }
  }
}

export async function updateProduct(id: string, data: ProductInput) {
  try {
    await requireAdminThrow()
    const supabase = createServiceRoleClient() as Any

    const baseSlug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name)
    if (!baseSlug) {
      throw new Error("Invalid product name: unable to generate slug")
    }

    const slug = await generateUniqueSlug(supabase, baseSlug, id)

    const { error } = await supabase
      .from("products")
      .update({
        name: data.name,
        slug,
        description: data.description || null,
        category_id: data.category_id || null,
        price: Math.round(Number(data.price) || 0),
        sale_price: data.sale_price != null ? Math.round(Number(data.sale_price)) : null,
        is_on_sale: data.is_on_sale ?? false,
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
        inventory_count: Math.round(Number(data.inventory_count) || 0),
        craft_type: data.craft_type || null,
        cover_url: data.cover_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("[updateProduct] Database error:", error)
      throw new Error(error.message)
    }

    if (data.gallery_urls) {
      await supabase.from("product_images").delete().eq("product_id", id)
      if (data.gallery_urls.length > 0) {
        const images = data.gallery_urls.map((url, i) => ({
          product_id: id,
          image_url: url,
          sort_order: i,
          is_primary: i === 0,
        }))
        const { error: imgError } = await supabase
          .from("product_images")
          .insert(images)
        if (imgError) {
          console.error("[updateProduct] Image insert error:", imgError)
          throw new Error(imgError.message)
        }
      }
    }

    await supabase.from("product_variants").delete().eq("product_id", id)

    const sizes = (data.sizes ?? []).filter((s) => s && s !== "Default")
    const colors = (data.colors ?? []).filter((c) => c && c.name)

    let variantsToInsert: {
      product_id: string
      size: string
      color: string
      color_hex: string | null
      inventory_count: number
      is_active: boolean
    }[] = []

    if (sizes.length > 0 && colors.length > 0) {
      const seen = new Set<string>()
      variantsToInsert = sizes.flatMap((size) =>
        colors.map((color) => {
          const key = `${size}-${color.name}`
          if (seen.has(key)) return null
          seen.add(key)
          return {
            product_id: id,
            size,
            color: color.name,
            color_hex: color.hex,
            inventory_count: 0,
            is_active: true,
          }
        })
      ).filter(Boolean) as Any
    } else if (sizes.length > 0) {
      const seen = new Set<string>()
      variantsToInsert = sizes.map((size) => {
        if (seen.has(size)) return null
        seen.add(size)
        return {
          product_id: id,
          size,
          color: "Default",
          color_hex: null,
          inventory_count: 0,
          is_active: true,
        }
      }).filter(Boolean) as Any
    } else if (colors.length > 0) {
      const seen = new Set<string>()
      variantsToInsert = colors.map((color) => {
        if (seen.has(color.name)) return null
        seen.add(color.name)
        return {
          product_id: id,
          size: "Default",
          color: color.name,
          color_hex: color.hex,
          inventory_count: 0,
          is_active: true,
        }
      }).filter(Boolean) as Any
    }

    if (variantsToInsert.length > 0) {
      const { error: varError } = await supabase
        .from("product_variants")
        .insert(variantsToInsert)
      if (varError) {
        console.error("[updateProduct] Variant insert error:", varError)
        throw new Error(varError.message)
      }
    }

    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${id}/edit`)
    revalidatePath("/")
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error updating product"
    console.error("[updateProduct] Exception:", err)
    return { ok: false, error: message }
  }
}

export async function deleteProduct(id: string) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient() as Any

  await supabase.from("product_images").delete().eq("product_id", id)
  await supabase.from("product_variants").delete().eq("product_id", id)

  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/admin/products")
}

export async function updateReviewStatus(reviewId: string, status: string) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient() as Any

  const { error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", reviewId)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/reviews")
}

export async function updateInquiryStatus(inquiryId: string, status: string) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient() as Any

  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", inquiryId)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/inquiries")
}

export async function updateSettings(settings: Record<string, string>) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient() as Any

  const rows = Object.entries(settings)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }))

  if (rows.length === 0) return

  const { error } = await supabase
    .from("site_settings")
    .upsert(rows, { onConflict: "key" })

  if (error) throw new Error(error.message)
  revalidatePath("/admin/settings")
}

export async function updateCategory(
  id: string | null,
  data: {
    name: string
    slug?: string
    parent_id?: string | null
    sort_order?: number
    is_active?: boolean
    image_url?: string | null
  }
) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient() as Any

  if (id) {
    const { error } = await supabase
      .from("categories")
      .update({
        name: data.name,
        slug: data.slug?.trim() ? slugify(data.slug) : slugify(data.name),
        parent_id: data.parent_id ?? null,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
        image_url: data.image_url ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from("categories").insert({
      name: data.name,
      slug: data.slug?.trim() ? slugify(data.slug) : slugify(data.name),
      parent_id: data.parent_id ?? null,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
      image_url: data.image_url ?? null,
    })
    if (error) throw new Error(error.message)
  }

  revalidatePath("/admin/categories")
  revalidatePath("/shop")
}

export async function deleteCategory(id: string) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient() as Any

  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/categories")
  revalidatePath("/shop")
}

export async function updateInventory(variantId: string, inventoryCount: number) {
  await requireAdminThrow()
  const supabase = createServiceRoleClient() as Any

  const { error } = await supabase
    .from("product_variants")
    .update({ inventory_count: inventoryCount })
    .eq("id", variantId)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/inventory")
}
