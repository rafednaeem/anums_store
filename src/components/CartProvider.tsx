"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/useCartStore";
import {
  loadGuestCart,
  saveGuestCart,
  clearGuestCart,
  loadUserCart,
  saveUserCart,
} from "@/lib/cart-db";

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useCartStore((s) => s.items);
  const loaded = useCartStore((s) => s.loaded);
  const loadItems = useCartStore((s) => s.loadItems);
  const clearCart = useCartStore((s) => s.clearCart);
  const userIdRef = useRef<string | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      userIdRef.current = user?.id ?? null;

      if (user) {
        loadUserCart(user.id).then((dbItems) => {
          if (dbItems.length > 0) {
            loadItems(dbItems);
          } else {
            const guestItems = loadGuestCart();
            loadItems(guestItems);
            if (guestItems.length > 0) {
              saveUserCart(user.id, guestItems);
              clearGuestCart();
            }
          }
        });
      } else {
        loadItems(loadGuestCart());
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUserId = session?.user?.id ?? null;
      const oldUserId = userIdRef.current;
      userIdRef.current = newUserId;

      if (event === "SIGNED_IN" && newUserId) {
        const guestItems = loadGuestCart();
        const dbItems = await loadUserCart(newUserId);

        if (dbItems.length > 0) {
          loadItems(dbItems);
        } else if (guestItems.length > 0) {
          loadItems(guestItems);
          saveUserCart(newUserId, guestItems);
          clearGuestCart();
        } else {
          loadItems([]);
        }
      }

      if (event === "SIGNED_OUT" && oldUserId) {
        saveUserCart(oldUserId, useCartStore.getState().items);
        clearCart();
        loadItems(loadGuestCart());
      }
    });

    return () => subscription.unsubscribe();
  }, [loadItems, clearCart]);

  useEffect(() => {
    if (!loaded) return;

    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const currentUserId = userIdRef.current;
      if (currentUserId) {
        saveUserCart(currentUserId, items);
      } else {
        saveGuestCart(items);
      }
    }, 500);
  }, [items, loaded]);

  return children;
}
