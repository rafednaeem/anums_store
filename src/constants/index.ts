export const ORDER_STATUSES = [
  "new",
  "payment_submitted",
  "payment_verified",
  "payment_rejected",
  "processing",
  "shipped",
  "dispatched",
  "delivered",
  "cancelled",
  "refunded",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ["payment_submitted", "cancelled"],
  payment_submitted: ["payment_verified", "payment_rejected", "cancelled"],
  payment_verified: ["processing", "cancelled"],
  payment_rejected: ["new", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["dispatched", "cancelled"],
  dispatched: ["delivered"],
  delivered: [],
  cancelled: [],
  refunded: [],
}

export const PAYMENT_METHODS = ["bank_transfer"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_STATUSES = ["pending", "submitted", "verified", "rejected", "paid", "failed"] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]
