import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    let cartQuery = supabase.from("carts").select("id").limit(1)

    if (user) {
      cartQuery = cartQuery.eq("user_id", user.id).is("session_id", null)
    } else if (sessionId) {
      cartQuery = cartQuery.eq("session_id", sessionId).is("user_id", null)
    } else {
      return NextResponse.json({ items: [] })
    }

    const { data: carts } = await cartQuery

    if (!carts || carts.length === 0) {
      return NextResponse.json({ items: [] })
    }

    const cartId = (carts[0] as Any).id

    const { data: cartItems } = await supabase
      .from("cart_items")
      .select(`
        id,
        product_id,
        variant_id,
        quantity,
        price_snapshot,
        products!inner(name, slug, cover_url, price, sale_price, is_on_sale),
        product_variants(size, color)
      `)
      .eq("cart_id", cartId)

    const items = (cartItems || []).map((item: Any) => ({
      id: item.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.products?.is_on_sale && item.products?.sale_price
        ? item.products.sale_price
        : item.products?.price || item.price_snapshot,
      name: item.products?.name || "Unknown Product",
      image: item.products?.cover_url || null,
      size: item.product_variants?.size || null,
      color: item.product_variants?.color || null,
    }))

    return NextResponse.json({ cartId, items })
  } catch (error: Any) {
    console.error("Cart fetch error:", error)
    return NextResponse.json({ items: [] })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { product_id, variant_id, quantity = 1, session_id } = body

    if (!product_id) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      )
    }

    const serviceRole = createServiceRoleClient() as Any

    const { data: product } = await serviceRole
      .from("products")
      .select("price, sale_price, is_on_sale")
      .eq("id", product_id)
      .single()

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    const price = product.is_on_sale && product.sale_price
      ? product.sale_price
      : product.price

    let cartId: string | null = null

    if (user) {
      const { data: existingCart } = await serviceRole
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .is("session_id", null)
        .single()

      if (existingCart) {
        cartId = existingCart.id
      } else {
        const { data: newCart } = await serviceRole
          .from("carts")
          .insert({ user_id: user.id })
          .select("id")
          .single()

        cartId = newCart?.id || null
      }
    } else if (session_id) {
      const { data: existingCart } = await serviceRole
        .from("carts")
        .select("id")
        .eq("session_id", session_id)
        .is("user_id", null)
        .single()

      if (existingCart) {
        cartId = existingCart.id
      } else {
        const { data: newCart } = await serviceRole
          .from("carts")
          .insert({ session_id })
          .select("id")
          .single()

        cartId = newCart?.id || null
      }
    }

    if (!cartId) {
      return NextResponse.json(
        { error: "Failed to create cart" },
        { status: 500 }
      )
    }

    const { data: existingItem } = await serviceRole
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", product_id)
      .eq("variant_id", variant_id || null)
      .single()

    if (existingItem) {
      await serviceRole
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
    } else {
      await serviceRole
        .from("cart_items")
        .insert({
          cart_id: cartId,
          product_id,
          variant_id: variant_id || null,
          quantity,
          price_snapshot: price,
        })
    }

    await serviceRole
      .from("carts")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", cartId)

    return NextResponse.json({ success: true, cartId })
  } catch (error: Any) {
    console.error("Cart add error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { item_id, quantity } = body

    if (!item_id || quantity === undefined) {
      return NextResponse.json(
        { error: "item_id and quantity are required" },
        { status: 400 }
      )
    }

    const serviceRole = createServiceRoleClient() as Any

    if (quantity <= 0) {
      await serviceRole
        .from("cart_items")
        .delete()
        .eq("id", item_id)
    } else {
      await serviceRole
        .from("cart_items")
        .update({ quantity })
        .eq("id", item_id)
    }

    return NextResponse.json({ success: true })
  } catch (error: Any) {
    console.error("Cart update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get("item_id")

    if (!itemId) {
      return NextResponse.json(
        { error: "item_id is required" },
        { status: 400 }
      )
    }

    const serviceRole = createServiceRoleClient() as Any

    await serviceRole
      .from("cart_items")
      .delete()
      .eq("id", itemId)

    return NextResponse.json({ success: true })
  } catch (error: Any) {
    console.error("Cart delete error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
