import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { checkoutSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"
import { generateOrderNumber } from "@/lib/seo"
import { getSettings } from "@/lib/settings"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

const PROVINCE_TO_SETTING_KEY: Record<string, string> = {
  Punjab: "shipping_rate_punjab",
  Sindh: "shipping_rate_sindh",
  "Khyber Pakhtunkhwa": "shipping_rate_kpk",
  Balochistan: "shipping_rate_balochistan",
  "Islamabad Capital Territory": "shipping_rate_islamabad",
  "Azad Jammu & Kashmir": "shipping_rate_ajk",
  "Gilgit-Baltistan": "shipping_rate_gb",
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const rateLimitKey = `order_create:${ip}`
  const { success } = rateLimit(rateLimitKey, 5, 60000)

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()

    const validationResult = checkoutSchema.safeParse({
      shipping: body.shipping,
      payment_method: body.payment_method,
      notes: body.notes,
    })

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      return NextResponse.json(
        { error: firstError?.message ?? "Validation failed" },
        { status: 400 }
      )
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      )
    }

    if (body.idempotency_key) {
      const supabase = await createClient()
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, order_number")
        .eq("idempotency_key", body.idempotency_key)
        .maybeSingle()

      if (existingOrder) {
        return NextResponse.json({
          orderId: (existingOrder as Any).id,
          orderNumber: (existingOrder as Any).order_number,
        })
      }
    }

    const serviceRole = createServiceRoleClient() as Any

    const productIds = body.items.map((item: Any) => item.product_id).filter(Boolean)
    const variantIds = body.items.map((item: Any) => item.variant_id).filter(Boolean)

    const productMap: Record<string, Any> = {}
    const variantMap: Record<string, Any> = {}

    if (productIds.length > 0) {
      const { data: products } = await serviceRole
        .from("products")
        .select("id, name, slug, price, sale_price, is_on_sale, cover_url, inventory_count")
        .in("id", productIds)

      if (products) {
        for (const p of products) {
          productMap[p.id] = p
        }
      }
    }

    if (variantIds.length > 0) {
      const { data: variants } = await serviceRole
        .from("product_variants")
        .select("id, product_id, size, color, inventory_count")
        .in("id", variantIds)

      if (variants) {
        for (const v of variants) {
          variantMap[v.id] = v
        }
      }
    }

    const validatedItems = body.items.map((item: Any) => {
      const product = productMap[item.product_id]
      if (!product) {
        throw new Error(`Product not found: ${item.product_id}`)
      }

      const unitPrice = product.is_on_sale && product.sale_price
        ? product.sale_price
        : product.price

      const quantity = Number(item.quantity) || 1

      if (product.inventory_count < quantity) {
        throw new Error(`Insufficient stock for ${product.name}`)
      }

      let size = item.size || null
      let color = item.color || null

      if (item.variant_id) {
        const variant = variantMap[item.variant_id]
        if (variant) {
          size = variant.size
          color = variant.color
          if (variant.inventory_count < quantity) {
            throw new Error(`Insufficient stock for ${product.name} (${size}/${color})`)
          }
        }
      }

      return {
        product_id: product.id,
        product_slug: product.slug,
        product_name: product.name,
        product_image: product.cover_url || item.image || null,
        variant_id: item.variant_id || null,
        size,
        color,
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
      }
    })

    const allSettings = await getSettings()
    const subtotal = validatedItems.reduce(
      (sum: number, item: Any) => sum + item.total_price,
      0
    )
    const freeShippingThreshold = Number(allSettings.free_shipping_threshold) || 10000
    const defaultShippingRate = Number(allSettings.default_shipping_rate) || 500

    let shipping = 0
    if (subtotal < freeShippingThreshold) {
      const provinceKey = PROVINCE_TO_SETTING_KEY[body.shipping.province]
      const provinceRate = provinceKey
        ? Number(allSettings[provinceKey])
        : NaN
      shipping = Number.isFinite(provinceRate) && provinceRate > 0
        ? provinceRate
        : defaultShippingRate
    }

    const total = subtotal + shipping

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const orderNumber = generateOrderNumber()
    const fullName = String(body.shipping.full_name || "").trim()
    const nameParts = fullName.split(/\s+/)
    const firstName = nameParts[0] || fullName
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

    const orderData = {
      order_number: orderNumber,
      user_id: user?.id || null,
      guest_email: body.shipping.guest_email || null,
      customer_name: firstName,
      customer_last_name: lastName,
      phone: body.shipping.phone,
      address: [body.shipping.address_line1, body.shipping.address_line2]
        .filter(Boolean)
        .join(", "),
      city: body.shipping.city,
      province: body.shipping.province,
      postal_code: body.shipping.postal_code || null,
      items: validatedItems as unknown as Any,
      subtotal,
      shipping,
      total,
      payment_method: "bank_transfer",
      payment_status: body.payment_proof_url ? "submitted" : "pending",
      status: "new",
      notes: body.notes || null,
      idempotency_key: body.idempotency_key || null,
    }

    const { data: order, error: orderError } = await serviceRole
      .from("orders")
      .insert(orderData)
      .select("id, order_number")
      .single()

    if (orderError || !order) {
      console.error("Order creation error:", orderError)
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      )
    }

    const orderItems = validatedItems.map((item: Any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_slug: item.product_slug,
      product_name: item.product_name,
      product_image: item.product_image,
      variant_id: item.variant_id,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }))

    await serviceRole.from("order_items").insert(orderItems)

    const paymentRecord = {
      order_id: order.id,
      method: "bank_transfer",
      amount: total,
      status: body.payment_proof_url ? "submitted" : "pending",
      proof_url: body.payment_proof_url || null,
      proof_filename: body.payment_proof_filename || null,
    }

    await serviceRole.from("payments").insert(paymentRecord)

    await serviceRole.from("order_timeline").insert({
      order_id: order.id,
      status: "new",
      note: "Order placed",
    })

    for (const item of validatedItems) {
      const { data: currentProduct } = await serviceRole
        .from("products")
        .select("inventory_count")
        .eq("id", item.product_id)
        .single()

      if (currentProduct) {
        await serviceRole
          .from("products")
          .update({
            inventory_count: Math.max(
              0,
              currentProduct.inventory_count - item.quantity
            ),
          })
          .eq("id", item.product_id)
      }

      if (item.variant_id) {
        const { data: currentVariant } = await serviceRole
          .from("product_variants")
          .select("inventory_count")
          .eq("id", item.variant_id)
          .single()

        if (currentVariant) {
          await serviceRole
            .from("product_variants")
            .update({
              inventory_count: Math.max(
                0,
                currentVariant.inventory_count - item.quantity
              ),
            })
            .eq("id", item.variant_id)
        }
      }
    }

    if (user?.id && body.shipping.save_address) {
      await serviceRole.from("addresses").insert({
        user_id: user.id,
        label: body.shipping.address_label || "Home",
        full_name: fullName,
        phone: body.shipping.phone,
        address_line1: body.shipping.address_line1,
        address_line2: body.shipping.address_line2 || null,
        city: body.shipping.city,
        province: body.shipping.province,
        postal_code: body.shipping.postal_code || null,
        is_default: false,
      })
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error: Any) {
    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
