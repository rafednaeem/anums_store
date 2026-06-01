import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { isAdminConfigured, supabaseAdmin } from '@/lib/supabase-admin';
import { validateCheckoutPayload } from '@/lib/orders';
import { sendOrderNotifications } from '@/lib/notifications';
import { CartItem } from '@/store/useCartStore';

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
    }

    const body = await req.json();
    const { 
      name, 
      lastName, 
      phone, 
      address, 
      city, 
      postalCode, 
      items, 
      paymentMethod,
      userId,
      idempotencyKey,
    } = body;

    const validationErrors = validateCheckoutPayload({ name, lastName, phone, address, city, postalCode, items, paymentMethod });
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json({ error: 'Invalid checkout details', errors: validationErrors }, { status: 400 });
    }

    // M-04: Idempotency check — return existing order if same key was used
    if (idempotencyKey) {
      const db = isAdminConfigured ? supabaseAdmin : supabase;
      const { data: existing } = await db
        .from("orders")
        .select("id")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ orderId: existing.id, restored: true });
      }
    }

    const cartItems = items as CartItem[];
    const slugs = cartItems.map((item) => item.id);

    // M-03: Fetch current product prices and stock from DB
    const db = isAdminConfigured ? supabaseAdmin : supabase;
    const { data: productRows, error: productError } = await db
      .from("products")
      .select("id, slug, price, sale_price, is_on_sale, on_sale, stock")
      .in("slug", slugs);

    if (productError) throw productError;
    if (!productRows || productRows.length !== slugs.length) {
      const found = new Set((productRows ?? []).map((p) => p.slug));
      const missing = slugs.filter((s) => !found.has(s));
      return NextResponse.json({ error: `Products not found: ${missing.join(", ")}` }, { status: 400 });
    }

    const productBySlug = new Map(productRows.map((p) => [p.slug, p]));
    const serverItems: CartItem[] = [];

    // M-02: Validate stock and use server-side prices
    for (const clientItem of cartItems) {
      const product = productBySlug.get(clientItem.id);
      if (!product) {
        return NextResponse.json({ error: `Product "${clientItem.id}" not found` }, { status: 400 });
      }

      if (product.stock !== null && product.stock < clientItem.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${clientItem.name}". Available: ${product.stock}` },
          { status: 409 },
        );
      }

      const isOnSale = product.is_on_sale ?? product.on_sale ?? false;
      const unitPrice = isOnSale && product.sale_price != null
        ? Number(product.sale_price)
        : Number(product.price);

      serverItems.push({
        id: clientItem.id,
        name: clientItem.name,
        price: unitPrice,
        quantity: clientItem.quantity,
        image: clientItem.image || "",
        size: clientItem.size || "Default",
      });
    }

    // Calculate totals from server-side prices
    const subtotal = serverItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 10000 ? 0 : 500;
    const total = subtotal + shipping;

    // Create the order
    const orderPayload: Record<string, unknown> = {
      customer_name: name,
      customer_last_name: lastName,
      phone,
      address,
      city,
      postal_code: postalCode || null,
      user_id: userId || null,
      items: serverItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
        size: item.size || "Default",
      })),
      subtotal,
      shipping,
      total,
      total_amount: total,
      payment_method: paymentMethod,
      payment_status: "pending",
      status: "new",
    };

    if (idempotencyKey) {
      orderPayload.idempotency_key = idempotencyKey;
    }

    const { data: order, error: orderError } = await db
      .from("orders")
      .insert([orderPayload])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderId = order.id;

    // Insert order_items
    const { error: orderItemsError } = await db.from("order_items").insert(
      serverItems.map((item) => ({
        order_id: orderId,
        product_id: productBySlug.get(item.id)?.id ?? null,
        product_slug: item.id,
        product_name: item.name,
        product_image: item.image || null,
        size: item.size || "Default",
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      })),
    );

    if (orderItemsError) throw orderItemsError;

    // Create payment record
    const { error: paymentError } = await db.from("payments").insert({
      order_id: orderId,
      method: paymentMethod,
      amount: total,
      status: "pending",
    });

    if (paymentError) throw paymentError;

    sendOrderNotifications({
      id: orderId,
      customer_name: name,
      customer_last_name: lastName,
      phone,
      address,
      city,
      items: serverItems,
      total,
      payment_method: paymentMethod,
      status: "new",
    });

    if (paymentMethod === 'cod') {
      return NextResponse.json({ orderId, method: 'cod' });
    }

    if (paymentMethod === 'safepay') {
      if (!process.env.SAFEPAY_SECRET) {
        return NextResponse.json({ orderId, error: 'Safepay is not configured.' }, { status: 503 });
      }

      const response = await fetch('https://sandbox.api.getsafepay.com/order/v1/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SFPY-MERCHANT-SECRET': process.env.SAFEPAY_SECRET || '',
        },
        body: JSON.stringify({
          amount: total * 100,
          currency: 'PKR',
          order_id: orderId,
          redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error('Safepay API error:', response.status, errorBody);
        return NextResponse.json(
          { error: 'Payment gateway temporarily unavailable.' },
          { status: 502 }
        );
      }

      const data = await response.json();
      if (!data.data?.redirect_url) {
        console.error('Safepay missing redirect_url:', data);
        return NextResponse.json(
          { error: 'Payment gateway returned an unexpected response.' },
          { status: 502 }
        );
      }

      return NextResponse.json({ redirect: data.data.redirect_url });
    }

    if (paymentMethod === 'cashmaal') {
      if (!process.env.CASHMAAL_WEB_ID) {
        return NextResponse.json({ orderId, error: 'Cashmaal is not configured.' }, { status: 503 });
      }

      return NextResponse.json({ redirect: `/api/cashmaal-redirect?orderId=${orderId}` });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

  } catch (error: unknown) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Unable to create order right now.' }, { status: 500 });
  }
}
