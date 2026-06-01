import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { isAdminConfigured, supabaseAdmin } from '@/lib/supabase-admin';
import { calculateOrderTotals, validateCheckoutPayload } from '@/lib/orders';
import { sendOrderNotifications } from '@/lib/notifications';
import { CartItem } from '@/store/useCartStore';

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' }, { status: 503 });
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
      userId 
    } = body;
    const validationErrors = validateCheckoutPayload({ name, lastName, phone, address, city, postalCode, items, paymentMethod });

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json({ error: 'Invalid checkout details', errors: validationErrors }, { status: 400 });
    }

    const { subtotal, shipping, total } = calculateOrderTotals(items);
    const db = isAdminConfigured ? supabaseAdmin : supabase;

    const { data: order, error: orderError } = await db
      .from('orders')
      .insert([
        {
          customer_name: name,
          customer_last_name: lastName,
          phone,
          address,
          city,
          postal_code: postalCode || null,
          user_id: userId || null,
          items: (items as CartItem[]).map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || '',
            size: item.size || 'Default',
          })),
          subtotal,
          shipping,
          total,
          payment_method: paymentMethod,
          payment_status: 'pending',
          status: 'new',
          total_amount: total
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderId = order.id;
    const cartItems = items as CartItem[];
    const slugs = cartItems.map((item) => item.id);
    const { data: productRows } = await db
      .from("products")
      .select("id, slug")
      .in("slug", slugs);
    const productBySlug = new Map((productRows ?? []).map((product) => [product.slug, product.id]));

    const { error: orderItemsError } = await db.from("order_items").insert(
      cartItems.map((item) => ({
        order_id: orderId,
        product_id: productBySlug.get(item.id) ?? null,
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
      items: items as CartItem[],
      total,
      payment_method: paymentMethod,
      status: 'new',
    });

    if (paymentMethod === 'cod') {
      return NextResponse.json({ orderId, method: 'cod' });
    }

    if (paymentMethod === 'safepay') {
      if (!process.env.SAFEPAY_SECRET) {
        return NextResponse.json({ orderId, error: 'Safepay is not configured for online payments.' }, { status: 503 });
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
          { error: 'Payment gateway temporarily unavailable. Please try COD or another method.' },
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
        return NextResponse.json({ orderId, error: 'Cashmaal is not configured for online payments.' }, { status: 503 });
      }

      return NextResponse.json({ redirect: `/api/cashmaal-redirect?orderId=${orderId}` });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

  } catch (error: unknown) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Unable to create order right now.' }, { status: 500 });
  }
}
