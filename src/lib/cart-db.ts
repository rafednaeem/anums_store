import { supabase } from "@/lib/supabaseClient";
import type { CartItem } from "@/store/useCartStore";

const GUEST_KEY = "anums-store-cart";

export function loadGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items: CartItem[]) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {}
}

export function clearGuestCart() {
  try {
    localStorage.removeItem(GUEST_KEY);
  } catch {}
}

export async function loadUserCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("user_carts")
    .select("items")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("loadUserCart error:", error);
    return [];
  }

  if (!data || !Array.isArray(data.items)) return [];
  return data.items as CartItem[];
}

export async function saveUserCart(userId: string, items: CartItem[]) {
  const { error } = await supabase.from("user_carts").upsert(
    { user_id: userId, items, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("saveUserCart error:", error);
  }
}
