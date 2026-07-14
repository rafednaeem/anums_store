import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

interface GuestCartItem {
  product_id: string
  variant_id: string | null
  quantity: number
  price: number
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { guest_cart_items } = body as { guest_cart_items: GuestCartItem[] }

    if (!Array.isArray(guest_cart_items) || guest_cart_items.length === 0) {
      return NextResponse.json({ success: true, merged: 0 })
    }

    const serviceRole = createServiceRoleClient() as Any

    // Find or create user cart
    const { data: existingCart } = await serviceRole
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .is("session_id", null)
      .single()

    let cartId = existingCart?.id

    if (!cartId) {
      const { data: newCart } = await serviceRole
        .from("carts")
        .insert({ user_id: user.id })
        .select("id")
        .single()
      cartId = newCart?.id
    }

    if (!cartId) {
      return NextResponse.json(
        { error: "Failed to create cart" },
        { status: 500 }
      )
    }

    // Load existing DB cart items for merging
    const { data: dbCartItems } = await serviceRole
      .from("cart_items")
      .select("id, product_id, variant_id, quantity")
      .eq("cart_id", cartId)

    // Build a map of existing items for quick lookup
    const existingItemsMap = new Map<string, { id: string; quantity: number }>()
    for (const item of dbCartItems || []) {
      const key = item.variant_id
        ? `${item.product_id}_${item.variant_id}`
        : item.product_id
      existingItemsMap.set(key, { id: item.id, quantity: item.quantity })
    }

    let mergedCount = 0

    for (const guestItem of guest_cart_items) {
      const key = guestItem.variant_id
        ? `${guestItem.product_id}_${guestItem.variant_id}`
        : guestItem.product_id

      const existing = existingItemsMap.get(key)

      if (existing) {
        // Increment quantity
        await serviceRole
          .from("cart_items")
          .update({ quantity: existing.quantity + guestItem.quantity })
          .eq("id", existing.id)
        mergedCount++
      } else {
        // Insert new item
        await serviceRole.from("cart_items").insert({
          cart_id: cartId,
          product_id: guestItem.product_id,
          variant_id: guestItem.variant_id || null,
          quantity: guestItem.quantity,
          price_snapshot: guestItem.price,
        })
        mergedCount++
      }
    }

    // Update cart timestamp
    await serviceRole
      .from("carts")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", cartId)

    return NextResponse.json({ success: true, merged: mergedCount })
  } catch (error: Any) {
    console.error("Cart merge error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
