export { supabase, isSupabaseConfigured } from "./supabaseClient";
export { sanityClient, isSanityConfigured } from "./sanityClient";
export { urlFor } from "./sanityImage";
export {
  getProducts,
  getFeaturedProducts,
} from "./products";
export type { ProductSort, ProductListItem, ProductFilters } from "./products";
export {
  calculateOrderTotals,
  validateCheckoutPayload,
  getUserOrders,
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
} from "./orders";
export type { CheckoutPayload, OrderRecord } from "./orders";
export {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "./addresses";
export type { AddressInput, AddressRecord } from "./addresses";
export {
  verifySafepaySignature,
  verifyCashmaalSignature,
  detectPaymentGateway,
  SAFEPAY_WEBHOOK_HEADER,
  CASHMAAL_WEBHOOK_HEADER,
  SAFEPAY_SUCCESS_STATUSES,
  CASHMAAL_SUCCESS_STATUSES,
} from "./payments";
