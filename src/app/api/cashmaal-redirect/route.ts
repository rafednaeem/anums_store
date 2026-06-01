import { NextResponse } from "next/server";
import { isAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";
import { supabase } from "@/lib/supabaseClient";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const webId = process.env.CASHMAAL_WEB_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anumsstore.netlify.app";

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  if (!webId) {
    return NextResponse.json({ error: "Cashmaal is not configured" }, { status: 503 });
  }

  const db = isAdminConfigured ? supabaseAdmin : supabase;
  const { data: order, error } = await db
    .from("orders")
    .select("id,total,customer_name,customer_last_name,phone,payment_method,payment_status")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.payment_method !== "cashmaal") {
    return NextResponse.json({ error: "Order is not a Cashmaal order" }, { status: 400 });
  }

  if (order.payment_status === "paid") {
    return NextResponse.redirect(`${siteUrl}/order-confirmation?id=${order.id}`);
  }

  const phoneEmail = `${String(order.phone).replace(/\D/g, "") || "customer"}@anumsstore.net`;
  const fields: Record<string, string> = {
    pay_method: "",
    amount: String(order.total),
    currency: "PKR",
    succes_url: `${siteUrl}/order-confirmation?id=${order.id}`,
    cancel_url: `${siteUrl}/checkout`,
    client_email: phoneEmail,
    web_id: webId,
    order_id: order.id,
    addi_info: `Anums order ${order.id.slice(0, 8)}`,
  };

  const inputs = Object.entries(fields)
    .map(([name, value]) => `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`)
    .join("");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting to CashMaal</title>
  </head>
  <body>
    <form id="cashmaal-payment-form" action="https://cmaal.com/Pay/" method="POST">
      ${inputs}
      <noscript>
        <button type="submit">Continue to CashMaal</button>
      </noscript>
    </form>
    <script>
      document.getElementById("cashmaal-payment-form").submit();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
