export const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "Anums Store"
export const storeUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://anumsstore.pk"
export const storeEmail = process.env.NEXT_PUBLIC_STORE_EMAIL || "info@anumsstore.pk"
export const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE || "+923224183457"
export const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923224183457"

export const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
] as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "New",
  payment_submitted: "Payment Submitted",
  payment_verified: "Payment Verified",
  payment_rejected: "Payment Rejected",
  processing: "Processing",
  shipped: "Shipped",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  submitted: "Submitted",
  verified: "Verified",
  rejected: "Rejected",
  paid: "Paid",
  failed: "Failed",
}
