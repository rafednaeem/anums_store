import { businessSettings } from '../config';
import { baseLayout } from './base-layout';

interface OrderEmailData {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  total_amount: number;
  currency: string;
  payment_method: string;
  shipping_address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  created_at: string;
  shipping_cost?: number;
  notes?: string;
}

function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function buildItemsTable(items: OrderEmailData['items'], currency: string): string {
  let rows = '';
  for (const item of items) {
    rows += `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">${item.product_name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; text-align: right;">${formatCurrency(item.unit_price, currency)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; text-align: right;">${formatCurrency(item.total_price, currency)}</td>
      </tr>`;
  }

  const shippingLine = `
    <tr>
      <td colspan="3" style="padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; text-align: right;">Shipping</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; text-align: right;">Included</td>
    </tr>`;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 10px 12px; border-bottom: 2px solid #1a1a2e; color: #1a1a2e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
          <th style="text-align: center; padding: 10px 12px; border-bottom: 2px solid #1a1a2e; color: #1a1a2e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
          <th style="text-align: right; padding: 10px 12px; border-bottom: 2px solid #1a1a2e; color: #1a1a2e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
          <th style="text-align: right; padding: 10px 12px; border-bottom: 2px solid #1a1a2e; color: #1a1a2e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        ${shippingLine}
        <tr>
          <td colspan="3" style="padding: 12px 12px; border-bottom: 2px solid #1a1a2e; font-weight: 700; font-size: 16px; text-align: right;">Grand Total</td>
          <td style="padding: 12px 12px; border-bottom: 2px solid #1a1a2e; font-weight: 700; font-size: 16px; text-align: right;">${formatCurrency(items.reduce((sum, i) => sum + i.total_price, 0), currency)}</td>
        </tr>
      </tbody>
    </table>`;
}

function buildShippingInfo(address: OrderEmailData['shipping_address']): string {
  const parts = [address.street, address.city, address.state, address.postal_code, address.country].filter(Boolean);
  if (parts.length === 0) return '';

  return `
    <div style="background-color: #f8f9fa; border-left: 4px solid #e94560; padding: 16px 20px; margin: 20px 0; border-radius: 0 4px 4px 0;">
      <p style="margin: 0 0 4px; font-weight: 600; font-size: 14px; color: #1a1a2e;">Shipping Address</p>
      <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.5;">${parts.join(', ')}</p>
    </div>`;
}

function buildOrderHeader(orderNumber: string, orderDate: string): string {
  return `
    <p style="margin: 0 0 24px; font-size: 16px; color: #333333; line-height: 1.5;">
      Order <strong>#${orderNumber}</strong> &mdash; ${new Date(orderDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>`;
}

export async function orderConfirmed(order: OrderEmailData) {
  const settings = await businessSettings();

  const html = baseLayout({
    settings,
    preheader: `Your order #${order.order_number} has been received and is awaiting payment.`,
    title: `Order Confirmation - #${order.order_number}`,
    content: `
      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
        Hi <strong>${order.customer_name}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
        Thank you for your order! We've received it and it's awaiting payment.
      </p>
      ${buildOrderHeader(order.order_number, order.created_at)}
      ${buildItemsTable(order.items, order.currency)}
      ${order.payment_method === 'bank_transfer' ? `
        <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 6px;">
          <p style="margin: 0 0 12px; font-weight: 600; font-size: 15px; color: #856404;">Bank Transfer Details</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #856404; line-height: 1.6;">
            Please transfer <strong>${formatCurrency(order.total_amount, order.currency)}</strong> to:
          </p>
          <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.6;">
            Bank: ${settings.bankName}<br>
            Account Name: ${settings.bankAccountName}<br>
            Account Number: ${settings.bankAccountNumber}
          </p>
          <p style="margin: 12px 0 0; font-size: 13px; color: #856404;">
            After payment, please reply to this email with your payment receipt for verification.
          </p>
        </div>
      ` : ''}
      ${buildShippingInfo(order.shipping_address)}
      ${order.notes ? `
        <div style="background-color: #f8f9fa; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 4px; font-weight: 600; font-size: 14px;">Order Notes</p>
          <p style="margin: 0; font-size: 14px; color: #333333;">${order.notes}</p>
        </div>
      ` : ''}
      <p style="margin: 24px 0 0; font-size: 14px; color: #666666; line-height: 1.5;">
        Questions about your order? Simply reply to this email or contact us at ${settings.storeEmail}.
      </p>
    `,
  });

  return {
    subject: `Order Confirmation - #${order.order_number}`,
    html,
  };
}

export async function paymentVerified(order: OrderEmailData) {
  const settings = await businessSettings();

  const html = baseLayout({
    settings,
    preheader: `Your payment for order #${order.order_number} has been verified!`,
    title: `Payment Verified - #${order.order_number}`,
    content: `
      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
        Hi <strong>${order.customer_name}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
        Great news! Your payment of <strong>${formatCurrency(order.total_amount, order.currency)}</strong> for order <strong>#${order.order_number}</strong> has been verified and confirmed.
      </p>
      ${buildOrderHeader(order.order_number, order.created_at)}
      <div style="background-color: #d4edda; border: 1px solid #28a745; padding: 16px 20px; margin: 20px 0; border-radius: 6px;">
        <p style="margin: 0; font-size: 14px; color: #155724; font-weight: 600;">Payment Status: Verified</p>
      </div>
      <p style="margin: 20px 0 0; font-size: 16px; color: #333333; line-height: 1.5;">
        We'll start processing your order for shipping right away. You'll receive another email once your order has been shipped.
      </p>
    `,
  });

  return {
    subject: `Payment Verified - #${order.order_number}`,
    html,
  };
}

export async function paymentRejected(order: OrderEmailData, reason: string) {
  const settings = await businessSettings();

  const html = baseLayout({
    settings,
    preheader: `There was an issue with your payment for order #${order.order_number}.`,
    title: `Payment Issue - #${order.order_number}`,
    content: `
      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
        Hi <strong>${order.customer_name}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
        We were unable to verify your payment for order <strong>#${order.order_number}</strong>.
      </p>
      <div style="background-color: #f8d7da; border: 1px solid #dc3545; padding: 16px 20px; margin: 20px 0; border-radius: 6px;">
        <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px; color: #721c24;">Reason:</p>
        <p style="margin: 0; font-size: 14px; color: #721c24;">${reason}</p>
      </div>
      ${buildOrderHeader(order.order_number, order.created_at)}
      <p style="margin: 20px 0; font-size: 16px; color: #333333; line-height: 1.5;">
        Please try again with the correct payment details, or contact us if you believe this is an error.
      </p>
      ${order.payment_method === 'bank_transfer' ? `
        <div style="background-color: #f8f9fa; border-left: 4px solid #e94560; padding: 16px 20px; margin: 20px 0; border-radius: 0 4px 4px 0;">
          <p style="margin: 0 0 4px; font-weight: 600; font-size: 14px;">Bank Transfer Details</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.6;">
            Bank: ${settings.bankName}<br>
            Account Name: ${settings.bankAccountName}<br>
            Account Number: ${settings.bankAccountNumber}
          </p>
        </div>
      ` : ''}
      <p style="margin: 24px 0 0; font-size: 14px; color: #666666; line-height: 1.5;">
        Need help? Contact us at ${settings.storeEmail} or ${settings.storePhone}.
      </p>
    `,
  });

  return {
    subject: `Payment Issue - Order #${order.order_number}`,
    html,
  };
}

export async function orderShipped(order: OrderEmailData) {
  const settings = await businessSettings();

  const html = baseLayout({
    settings,
    preheader: `Your order #${order.order_number} has been shipped!`,
    title: `Order Shipped - #${order.order_number}`,
    content: `
      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
        Hi <strong>${order.customer_name}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
        Your order <strong>#${order.order_number}</strong> has been shipped and is on its way to you!
      </p>
      <div style="background-color: #d1ecf1; border: 1px solid #17a2b8; padding: 16px 20px; margin: 20px 0; border-radius: 6px;">
        <p style="margin: 0; font-size: 14px; color: #0c5460; font-weight: 600;">Shipping Status: Shipped</p>
      </div>
      ${buildShippingInfo(order.shipping_address)}
      ${buildOrderHeader(order.order_number, order.created_at)}
      ${buildItemsTable(order.items, order.currency)}
      <p style="margin: 20px 0 0; font-size: 14px; color: #666666; line-height: 1.5;">
        If you have any questions about your shipment, please contact us at ${settings.storeEmail}.
      </p>
    `,
  });

  return {
    subject: `Order Shipped - #${order.order_number}`,
    html,
  };
}

export async function orderDelivered(order: OrderEmailData) {
  const settings = await businessSettings();

  const html = baseLayout({
    settings,
    preheader: `Your order #${order.order_number} has been delivered!`,
    title: `Order Delivered - #${order.order_number}`,
    content: `
      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
        Hi <strong>${order.customer_name}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
        Great news! Your order <strong>#${order.order_number}</strong> has been delivered successfully.
      </p>
      <div style="background-color: #d4edda; border: 1px solid #28a745; padding: 16px 20px; margin: 20px 0; border-radius: 6px;">
        <p style="margin: 0; font-size: 14px; color: #155724; font-weight: 600;">Status: Delivered</p>
      </div>
      ${buildOrderHeader(order.order_number, order.created_at)}
      <p style="margin: 20px 0; font-size: 16px; color: #333333; line-height: 1.5;">
        We hope you love your purchase! If you have any feedback or need assistance, please don't hesitate to reach out.
      </p>
      <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.5;">
        Thank you for choosing ${settings.storeName}!
      </p>
    `,
  });

  return {
    subject: `Order Delivered - #${order.order_number}`,
    html,
  };
}

export async function orderCancelled(order: OrderEmailData) {
  const settings = await businessSettings();

  const html = baseLayout({
    settings,
    preheader: `Your order #${order.order_number} has been cancelled.`,
    title: `Order Cancelled - #${order.order_number}`,
    content: `
      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
        Hi <strong>${order.customer_name}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
        Your order <strong>#${order.order_number}</strong> has been cancelled.
      </p>
      <div style="background-color: #f8d7da; border: 1px solid #dc3545; padding: 16px 20px; margin: 20px 0; border-radius: 6px;">
        <p style="margin: 0; font-size: 14px; color: #721c24; font-weight: 600;">Order Status: Cancelled</p>
      </div>
      ${buildOrderHeader(order.order_number, order.created_at)}
      ${buildItemsTable(order.items, order.currency)}
      ${order.notes ? `
        <div style="background-color: #f8f9fa; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 4px; font-weight: 600; font-size: 14px;">Cancellation Note</p>
          <p style="margin: 0; font-size: 14px; color: #333333;">${order.notes}</p>
        </div>
      ` : ''}
      <p style="margin: 20px 0 0; font-size: 14px; color: #666666; line-height: 1.5;">
        If you believe this was a mistake, or if you'd like to place a new order, please contact us at ${settings.storeEmail}.
      </p>
    `,
  });

  return {
    subject: `Order Cancelled - #${order.order_number}`,
    html,
  };
}
