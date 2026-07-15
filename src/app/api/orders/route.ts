import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { checkoutSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"
import { generateOrderNumber } from "@/lib/seo"
import { getSettings } from "@/lib/settings"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

const isDev = process.env.NODE_ENV !== "production"

function logStage(stage: string, data?: Record<string, unknown>) {
  const entry = { timestamp: new Date().toISOString(), stage, ...data }
  console.log(`[ORDER] [${stage}]`, JSON.stringify(entry))
}

function logStageError(stage: string, error: Any, extra?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    stage,
    error: {
      message: error?.message || "Unknown error",
      code: error?.code || null,
      details: error?.details || null,
      hint: error?.hint || null,
    },
    ...extra,
  }
  console.error(`[ORDER] [${stage}] FAILED:`, JSON.stringify(entry))
}

function buildErrorResponse(params: {
  status: number
  stage: string
  message: string
  code?: string | null
  details?: string | null
  hint?: string | null
  debug?: Record<string, unknown>
}) {
  const body: Any = {
    success: false,
    stage: params.stage,
    message: params.message,
    code: params.code ?? null,
    details: params.details ?? null,
    hint: params.hint ?? null,
    debug: params.debug ?? {},
  }
  return NextResponse.json(body, { status: params.status })
}

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
  const startTime = Date.now()
  logStage("Request started", { method: "POST", path: "/api/orders" })

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const rateLimitKey = `order_create:${ip}`
  const { success } = rateLimit(rateLimitKey, 5, 60000)

  if (!success) {
    logStage("Rate limited", { ip })
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    logStage("Request body parsed", {
      hasShipping: !!body.shipping,
      paymentMethod: body.payment_method,
      itemCount: body.items?.length ?? 0,
      hasPaymentProofUrl: !!body.payment_proof_url,
      hasIdempotencyKey: !!body.idempotency_key,
    })

    logStage("Checkout validation started")
    const validationResult = checkoutSchema.safeParse({
      shipping: body.shipping,
      payment_method: body.payment_method,
      notes: body.notes,
    })

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      logStageError("Checkout validation", {
        message: firstError?.message ?? "Validation failed",
        code: "VALIDATION_ERROR",
      }, { zodErrors: validationResult.error.errors })
      return NextResponse.json(
        { error: firstError?.message ?? "Validation failed" },
        { status: 400 }
      )
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      logStageError("Checkout validation", {
        message: "Cart is empty",
        code: "EMPTY_CART",
      })
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      )
    }
    logStage("Checkout validation passed")

    if (body.idempotency_key) {
      logStage("Idempotency check", { idempotencyKey: body.idempotency_key })
      const supabase = await createClient()
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, order_number")
        .eq("idempotency_key", body.idempotency_key)
        .maybeSingle()

      if (existingOrder) {
        logStage("Idempotency hit - returning existing order", {
          orderId: (existingOrder as Any).id,
          orderNumber: (existingOrder as Any).order_number,
        })
        return NextResponse.json({
          orderId: (existingOrder as Any).id,
          orderNumber: (existingOrder as Any).order_number,
        })
      }
      logStage("Idempotency check passed - no existing order")
    }

    logStage("Authentication resolved")
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      logStageError("Authentication", authError)
    }

    const isGuest = !user?.id
    logStage("Guest/customer detected", {
      isGuest,
      userId: user?.id || null,
    })

    logStage("Cart validation started", { itemCount: body.items.length })
    const serviceRole = createServiceRoleClient() as Any

    const productIds = body.items.map((item: Any) => item.product_id).filter(Boolean)
    const variantIds = body.items.map((item: Any) => item.variant_id).filter(Boolean)

    const productMap: Record<string, Any> = {}
    const variantMap: Record<string, Any> = {}

    if (productIds.length > 0) {
      const { data: products, error: productsError } = await serviceRole
        .from("products")
        .select("id, name, slug, price, sale_price, is_on_sale, cover_url, inventory_count")
        .in("id", productIds)

      if (productsError) {
        logStageError("Fetching products", productsError, { productIds })
        return buildErrorResponse({
          status: 500,
          stage: "Fetching Products",
          message: productsError.message || "Failed to fetch products",
          code: productsError.code,
          details: productsError.details,
          hint: productsError.hint,
          debug: { isGuest, userId: user?.id || null, productIds },
        })
      }

      if (products) {
        for (const p of products) {
          productMap[p.id] = p
        }
      }
    }

    if (variantIds.length > 0) {
      const { data: variants, error: variantsError } = await serviceRole
        .from("product_variants")
        .select("id, product_id, size, color, inventory_count")
        .in("id", variantIds)

      if (variantsError) {
        logStageError("Fetching variants", variantsError, { variantIds })
        return buildErrorResponse({
          status: 500,
          stage: "Fetching Product Variants",
          message: variantsError.message || "Failed to fetch product variants",
          code: variantsError.code,
          details: variantsError.details,
          hint: variantsError.hint,
          debug: { isGuest, userId: user?.id || null, variantIds },
        })
      }

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
    logStage("Cart validation passed", { validatedItemCount: validatedItems.length })

    logStage("Shipping calculation started", { province: body.shipping.province })
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
    logStage("Shipping calculated", {
      subtotal,
      shipping,
      total,
      freeShippingThreshold,
      province: body.shipping.province,
    })

    const orderNumber = generateOrderNumber()
    const fullName = String(body.shipping.full_name || "").trim()
    const nameParts = fullName.split(/\s+/)
    const firstName = nameParts[0] || fullName
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

    const guestAccessToken = !user?.id ? crypto.randomUUID() : null

    const orderData = {
      order_number: orderNumber,
      user_id: user?.id || null,
      guest_email: body.shipping.guest_email || null,
      guest_access_token: guestAccessToken,
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

    logStage("Payment proof processed", {
      hasPaymentProof: !!body.payment_proof_url,
      paymentStatus: orderData.payment_status,
    })

    logStage("Order object created", {
      orderNumber,
      isGuest,
      userId: user?.id || null,
      guestEmail: body.shipping.guest_email || null,
      itemCount: validatedItems.length,
    })

    logStage("Database insert attempted", { table: "orders" })
    const { data: order, error: orderError } = await serviceRole
      .from("orders")
      .insert(orderData)
      .select("id, order_number")
      .single()

    if (orderError || !order) {
      logStageError("Order insert", orderError || { message: "No order returned" }, {
        orderData: { ...orderData, items: `[${validatedItems.length} items]` },
      })
      return buildErrorResponse({
        status: 500,
        stage: "Creating Order",
        message: orderError?.message || "Order record was not created",
        code: orderError?.code,
        details: orderError?.details,
        hint: orderError?.hint,
        debug: {
          isGuest,
          userId: user?.id || null,
          guestEmail: body.shipping.guest_email || null,
          cartItems: body.items.length,
          shippingProvince: body.shipping.province,
          paymentMethod: "bank_transfer",
          paymentProofUploaded: !!body.payment_proof_url,
          subtotal,
          shipping,
          total,
        },
      })
    }
    logStage("Order inserted", { orderId: order.id, orderNumber: order.order_number })

    logStage("Order items insert attempted", {
      table: "order_items",
      count: validatedItems.length,
    })
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

    const { error: itemsError } = await serviceRole.from("order_items").insert(orderItems)
    if (itemsError) {
      logStageError("Order items insert", itemsError, { orderId: order.id, itemCount: orderItems.length })
      return buildErrorResponse({
        status: 500,
        stage: "Creating Order Items",
        message: itemsError.message || "Failed to create order items",
        code: itemsError.code,
        details: itemsError.details,
        hint: itemsError.hint,
        debug: {
          isGuest,
          userId: user?.id || null,
          orderId: order.id,
          cartItems: body.items.length,
          shippingProvince: body.shipping.province,
          paymentMethod: "bank_transfer",
          paymentProofUploaded: !!body.payment_proof_url,
        },
      })
    }
    logStage("Order items inserted", { orderId: order.id, count: orderItems.length })

    logStage("Payment record insert attempted", { table: "payments" })
    const paymentRecord = {
      order_id: order.id,
      method: "bank_transfer",
      amount: total,
      status: body.payment_proof_url ? "submitted" : "pending",
      proof_url: body.payment_proof_url || null,
      proof_filename: body.payment_proof_filename || null,
    }

    const { error: paymentError } = await serviceRole.from("payments").insert(paymentRecord)
    if (paymentError) {
      logStageError("Payment record insert", paymentError, { orderId: order.id })
      return buildErrorResponse({
        status: 500,
        stage: "Creating Payment Record",
        message: paymentError.message || "Failed to create payment record",
        code: paymentError.code,
        details: paymentError.details,
        hint: paymentError.hint,
        debug: {
          isGuest,
          userId: user?.id || null,
          orderId: order.id,
          cartItems: body.items.length,
          shippingProvince: body.shipping.province,
          paymentMethod: "bank_transfer",
          paymentProofUploaded: !!body.payment_proof_url,
        },
      })
    }
    logStage("Payment record inserted", { orderId: order.id })

    logStage("Timeline entry insert attempted", { table: "order_timeline" })
    const { error: timelineError } = await serviceRole.from("order_timeline").insert({
      order_id: order.id,
      status: "new",
      note: "Order placed",
    })
    if (timelineError) {
      logStageError("Timeline entry insert", timelineError, { orderId: order.id })
      return buildErrorResponse({
        status: 500,
        stage: "Creating Timeline Entry",
        message: timelineError.message || "Failed to create timeline entry",
        code: timelineError.code,
        details: timelineError.details,
        hint: timelineError.hint,
        debug: {
          isGuest,
          userId: user?.id || null,
          orderId: order.id,
          cartItems: body.items.length,
          shippingProvince: body.shipping.province,
          paymentMethod: "bank_transfer",
          paymentProofUploaded: !!body.payment_proof_url,
        },
      })
    }
    logStage("Timeline entry inserted", { orderId: order.id })

    logStage("Inventory decrement started", { orderId: order.id, itemCount: validatedItems.length })
    for (const item of validatedItems) {
      const { data: currentProduct, error: fetchProductError } = await serviceRole
        .from("products")
        .select("inventory_count")
        .eq("id", item.product_id)
        .single()

      if (fetchProductError) {
        logStageError("Fetching product for inventory decrement", fetchProductError, {
          orderId: order.id,
          productId: item.product_id,
        })
      }

      if (currentProduct) {
        const { error: updateError } = await serviceRole
          .from("products")
          .update({
            inventory_count: Math.max(
              0,
              currentProduct.inventory_count - item.quantity
            ),
          })
          .eq("id", item.product_id)

        if (updateError) {
          logStageError("Product inventory decrement", updateError, {
            orderId: order.id,
            productId: item.product_id,
            currentInventory: currentProduct.inventory_count,
            decrementBy: item.quantity,
          })
        }
      }

      if (item.variant_id) {
        const { data: currentVariant, error: fetchVariantError } = await serviceRole
          .from("product_variants")
          .select("inventory_count")
          .eq("id", item.variant_id)
          .single()

        if (fetchVariantError) {
          logStageError("Fetching variant for inventory decrement", fetchVariantError, {
            orderId: order.id,
            variantId: item.variant_id,
          })
        }

        if (currentVariant) {
          const { error: updateVariantError } = await serviceRole
            .from("product_variants")
            .update({
              inventory_count: Math.max(
                0,
                currentVariant.inventory_count - item.quantity
              ),
            })
            .eq("id", item.variant_id)

          if (updateVariantError) {
            logStageError("Variant inventory decrement", updateVariantError, {
              orderId: order.id,
              variantId: item.variant_id,
              currentInventory: currentVariant.inventory_count,
              decrementBy: item.quantity,
            })
          }
        }
      }
    }
    logStage("Inventory decrement completed", { orderId: order.id })

    if (user?.id && body.shipping.save_address) {
      logStage("Address save attempted", { userId: user.id })
      const { error: addressError } = await serviceRole.from("addresses").insert({
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
      if (addressError) {
        logStageError("Address save", addressError, { userId: user.id })
      } else {
        logStage("Address saved", { userId: user.id })
      }
    }

    const duration = Date.now() - startTime
    logStage("Order creation completed", {
      orderId: order.id,
      orderNumber: order.order_number,
      isGuest,
      userId: user?.id || null,
      totalItems: validatedItems.length,
      total,
      duration: `${duration}ms`,
    })

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      guestAccessToken,
    })
  } catch (error: Any) {
    const duration = Date.now() - startTime
    logStageError("Unhandled exception", error, {
      duration: `${duration}ms`,
      stack: error?.stack,
    })
    return NextResponse.json(
      {
        success: false,
        stage: "Unknown (unhandled exception)",
        message: error.message || "Internal server error",
        code: error?.code ?? null,
        details: error?.details ?? null,
        hint: error?.hint ?? null,
        debug: {
          stack: error?.stack,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    )
  }
}
