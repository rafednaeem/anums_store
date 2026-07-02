export { getProvider } from './providers';
export type { EmailProvider, SendEmailParams } from './providers';
export { businessSettings, getBusinessSettings } from './config';
export type { BusinessSettings } from './config';
export { sendEmail, sendWithRetry, isDuplicate, logEmail } from './service';
export {
  sendOrderEmail,
  sendInquiryConfirmation,
  sendNewOrderAlert,
} from './integrations';
export { baseLayout } from './templates/base-layout';
export {
  orderConfirmed,
  paymentVerified,
  paymentRejected,
  orderShipped,
  orderDelivered,
  orderCancelled,
} from './templates/order-templates';
