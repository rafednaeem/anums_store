import { CartItem } from "@/store/useCartStore";

interface OrderNotification {
  id: string;
  customer_name: string;
  customer_last_name: string;
  phone: string;
  address: string;
  city: string;
  items: CartItem[];
  total: number;
  payment_method: string;
  status: string;
}

function buildOrderSummary(order: OrderNotification): string {
  return (
    `NEW ORDER #${order.id.slice(0, 8)}\n` +
    `Customer: ${order.customer_name} ${order.customer_last_name}\n` +
    `Phone: ${order.phone}\n` +
    `Address: ${order.address}, ${order.city}\n` +
    `Items: ${order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}\n` +
    `Total: Rs. ${order.total.toLocaleString()}\n` +
    `Payment: ${order.payment_method}\n` +
    `Status: ${order.status}`
  );
}

function buildOrderEmailHtml(order: OrderNotification): string {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.name}${item.size && item.size !== "Default" ? ` (${item.size})` : ""}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">Rs. ${item.price.toLocaleString()}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#6b21a8">Order Confirmed</h1>
      <p>Hi ${order.customer_name}, thank you for your order!</p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px;font-weight:bold">Order</td><td style="padding:4px">#${order.id.slice(0, 8)}</td></tr>
        <tr><td style="padding:4px;font-weight:bold">Payment</td><td style="padding:4px;text-transform:capitalize">${order.payment_method}</td></tr>
        <tr><td style="padding:4px;font-weight:bold">Status</td><td style="padding:4px;text-transform:capitalize">${order.status}</td></tr>
        <tr><td style="padding:4px;font-weight:bold">Shipping</td><td style="padding:4px">${order.address}, ${order.city}</td></tr>
      </table>

      <h2 style="color:#6b21a8;font-size:1.1rem">Items</h2>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px;text-align:left">Item</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Price</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:8px;font-weight:bold;text-align:right">Total</td>
            <td style="padding:8px;font-weight:bold;text-align:right;color:#ec4899">Rs. ${order.total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      <p style="margin-top:24px;color:#666;font-size:0.9rem">
        We will notify you when your order ships. You can track your order status on our website.
      </p>
      <hr style="border:none;border-top:1px solid #eee" />
      <p style="color:#999;font-size:0.8rem">Anums Store — Lahore, Pakistan</p>
    </div>
  `;
}

export async function sendWhatsAppAlert(order: OrderNotification) {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = process.env.NOTIFICATION_PHONE;

  if (token && phoneNumberId && recipient) {
    try {
      const message = buildOrderSummary(order);
      await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: recipient.replace(/[^0-9]/g, ""),
            type: "text",
            text: { body: message },
          }),
        },
      );
    } catch (err) {
      console.error("WhatsApp Cloud API error:", err);
    }
  } else {
    const waLink = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923224183457"}?text=${encodeURIComponent(buildOrderSummary(order))}`;
    console.log(`WhatsApp Fallback: ${waLink}`);
  }
}

export async function sendOrderConfirmationEmail(order: OrderNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATION_EMAIL;

  if (!apiKey || !fromEmail) {
    console.log("Email not sent: RESEND_API_KEY or NOTIFICATION_EMAIL not configured");
    return;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: order.phone.includes("@") ? order.phone : fromEmail,
        subject: `Order Confirmed — #${order.id.slice(0, 8)}`,
        html: buildOrderEmailHtml(order),
      }),
    });
  } catch (err) {
    console.error("Resend error:", err);
  }
}

export async function sendOrderNotifications(order: OrderNotification) {
  await Promise.allSettled([
    sendWhatsAppAlert(order),
    sendOrderConfirmationEmail(order),
  ]);
}
