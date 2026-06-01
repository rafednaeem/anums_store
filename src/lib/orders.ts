import { CartItem } from "@/store/useCartStore";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export const SHIPPING_FEE = 500;
export const FREE_SHIPPING_THRESHOLD = 10000;

export interface CheckoutPayload {
  name: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  items: CartItem[];
  paymentMethod: "cod" | "safepay" | "cashmaal";
}

export function calculateOrderTotals(items: CartItem[]) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}

export function validateCheckoutPayload(body: Partial<CheckoutPayload>) {
  const errors: Record<string, string> = {};
  const phoneRegex = /^(\+92|0)[0-9]{10}$/;
  const paymentMethods = ["cod", "safepay", "cashmaal"];

  if (!body.name?.trim()) errors.name = "First name is required";
  if (!body.lastName?.trim()) errors.lastName = "Last name is required";
  if (!body.address?.trim()) errors.address = "Address is required";
  if (!body.city?.trim()) errors.city = "City is required";
  if (!body.phone?.trim()) errors.phone = "Phone number is required";
  else if (!phoneRegex.test(body.phone)) errors.phone = "Invalid Pakistani phone number";
  if (!body.paymentMethod || !paymentMethods.includes(body.paymentMethod)) errors.paymentMethod = "Invalid payment method";
  if (!Array.isArray(body.items) || body.items.length === 0) errors.items = "Cart is empty";

  const items = Array.isArray(body.items) ? body.items : [];
  items.forEach((item, index) => {
    if (!item.id || !item.name) errors[`items.${index}`] = "Invalid cart item";
    if (!Number.isFinite(item.price) || item.price <= 0) errors[`items.${index}.price`] = "Invalid cart item price";
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) errors[`items.${index}.quantity`] = "Invalid cart item quantity";
  });

  return errors;
}

export interface OrderRecord {
  id: string;
  customer_name: string;
  customer_last_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code?: string | null;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
}

export async function getUserOrders(userId: string): Promise<OrderRecord[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getUserOrders error:", error);
    return [];
  }

  return data;
}
