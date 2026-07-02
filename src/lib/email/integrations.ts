import { createClient } from '@/lib/supabase/server';
import { businessSettings } from './config';
import { sendWithRetry, isDuplicate, logEmail } from './service';
import {
  orderConfirmed,
  paymentVerified,
  paymentRejected,
  orderShipped,
  orderDelivered,
  orderCancelled,
} from './templates/order-templates';

type OrderEvent =
  | 'confirmed'
  | 'payment_verified'
  | 'payment_rejected'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

const templateMap: Record<OrderEvent, (order: any, extra?: any) => Promise<{ subject: string; html: string }>> = {
  confirmed: (order) => orderConfirmed(order),
  payment_verified: (order) => paymentVerified(order),
  payment_rejected: (order, reason: string) => paymentRejected(order, reason),
  shipped: (order) => orderShipped(order),
  delivered: (order) => orderDelivered(order),
  cancelled: (order) => orderCancelled(order),
};

export async function sendOrderEmail(orderId: string, event: OrderEvent, extra?: any): Promise<boolean> {
  const supabase = await createClient();

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    console.error('Failed to fetch order for email:', fetchError?.message);
    return false;
  }

  const emailData = {
    id: order.id,
    order_number: order.order_number,
    customer_email: order.customer_email,
    customer_name: order.customer_name,
    total_amount: order.total_amount,
    currency: order.currency || 'NGN',
    payment_method: order.payment_method,
    shipping_address: order.shipping_address || {},
    items: order.order_items || [],
    created_at: order.created_at,
    shipping_cost: order.shipping_cost,
    notes: order.notes,
  };

  const dedupKey = `order-${orderId}-${event}`;
  if (await isDuplicate(dedupKey)) {
    console.log(`Skipping duplicate email: ${dedupKey}`);
    return true;
  }

  const templateFn = templateMap[event];
  if (!templateFn) {
    console.error(`Unknown order event: ${event}`);
    return false;
  }

  try {
    const { subject, html } = await templateFn(emailData, extra);

    const result = await sendWithRetry({
      to: emailData.customer_email,
      subject,
      html,
    });

    await logEmail(
      { to: emailData.customer_email, subject, html },
      'sent',
      result.id
    );

    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Failed to send order email (${event}):`, errorMsg);

    await logEmail(
      { to: emailData.customer_email, subject: `Order ${event}`, html: '' },
      'failed',
      undefined,
      errorMsg
    );

    return false;
  }
}

export async function sendInquiryConfirmation(inquiryId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', inquiryId)
    .single();

  if (error || !inquiry) {
    console.error('Failed to fetch inquiry for email:', error?.message);
    return false;
  }

  const settings = await businessSettings();
  const dedupKey = `inquiry-confirm-${inquiryId}`;

  if (await isDuplicate(dedupKey)) {
    return true;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${settings.storeName}</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
                Hi <strong>${inquiry.name}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
                Thank you for reaching out to us! We've received your inquiry and our team will get back to you as soon as possible.
              </p>
              <div style="background-color: #f8f9fa; border-left: 4px solid #e94560; padding: 16px 20px; margin: 20px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 0 0 4px; font-weight: 600; font-size: 14px;">Your Message</p>
                <p style="margin: 0; font-size: 14px; color: #666666;">${inquiry.message}</p>
              </div>
              <p style="margin: 20px 0 0; font-size: 14px; color: #666666; line-height: 1.5;">
                We typically respond within 24-48 hours. If your matter is urgent, please call us at ${settings.storePhone || 'our customer support line'}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #666666; margin: 0; font-size: 13px;">
                ${settings.storeName} &bull; ${settings.storeEmail}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const result = await sendWithRetry({
      to: inquiry.email,
      subject: `We received your message - ${settings.storeName}`,
      html,
    });

    await logEmail(
      { to: inquiry.email, subject: `We received your message - ${settings.storeName}`, html },
      'sent',
      result.id
    );

    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to send inquiry confirmation:', errorMsg);

    await logEmail(
      { to: inquiry.email, subject: 'Inquiry Confirmation', html },
      'failed',
      undefined,
      errorMsg
    );

    return false;
  }
}

export async function sendNewOrderAlert(order: {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  payment_method: string;
}): Promise<boolean> {
  const settings = await businessSettings();
  const adminEmail = process.env.ADMIN_EMAIL || settings.storeEmail;

  const dedupKey = `new-order-alert-${order.id}`;
  if (await isDuplicate(dedupKey)) {
    return true;
  }

  const formatCurrency = (amount: number, currency: string = 'NGN') =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${settings.storeName}</h1>
              <p style="color: #e94560; margin: 8px 0 0; font-size: 14px;">New Order Alert</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px;">
              <div style="background-color: #d4edda; border: 1px solid #28a745; padding: 16px 20px; margin: 0 0 24px; border-radius: 6px;">
                <p style="margin: 0; font-size: 16px; color: #155724; font-weight: 600;">New order received!</p>
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #666666; width: 140px;">Order Number</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; font-weight: 600;">#${order.order_number}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #666666;">Customer</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">${order.customer_name} (${order.customer_email})</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #666666;">Amount</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; font-weight: 600;">${formatCurrency(order.total_amount, order.currency)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 14px; color: #666666;">Payment</td>
                  <td style="padding: 10px 12px; font-size: 14px; text-transform: capitalize;">${order.payment_method.replace('_', ' ')}</td>
                </tr>
              </table>
              <a href="${settings.storeWebsite}/admin/orders/${order.id}" style="display: inline-block; padding: 14px 32px; background-color: #e94560; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 24px 0;">
                View Order
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #666666; margin: 0; font-size: 13px;">${settings.storeName} Admin</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const result = await sendWithRetry({
      to: adminEmail,
      subject: `New Order #${order.order_number} - ${formatCurrency(order.total_amount, order.currency)}`,
      html,
    });

    await logEmail(
      { to: adminEmail, subject: `New Order #${order.order_number}`, html },
      'sent',
      result.id
    );

    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to send new order alert:', errorMsg);

    await logEmail(
      { to: adminEmail, subject: 'New Order Alert', html },
      'failed',
      undefined,
      errorMsg
    );

    return false;
  }
}
