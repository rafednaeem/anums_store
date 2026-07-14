"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"

export type CartItem = {
  id: string
  product_id: string
  variant_id: string | null
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (productId: string, variantId: string | null) => void
  updateQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number
  ) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isLoading: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

const GUEST_CART_KEY = "guest_cart"

function generateCartItemId(productId: string, variantId: string | null): string {
  return variantId ? `${productId}_${variantId}` : productId
}

function getCartKey(userId: string | null): string {
  return userId ? `cart_${userId}` : GUEST_CART_KEY
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null
  return sessionStorage
}

function loadCart(key: string): CartItem[] {
  const storage = getStorage()
  if (!storage) return []
  try {
    const raw = storage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCart(key: string, items: CartItem[]): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(key, JSON.stringify(items))
  } catch {
    // Storage full or unavailable
  }
}

function clearGuestCart(): void {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(GUEST_CART_KEY)
}

function mergeCarts(guestItems: CartItem[], dbItems: CartItem[]): CartItem[] {
  const merged = new Map<string, CartItem>()

  for (const item of dbItems) {
    const key = generateCartItemId(item.product_id, item.variant_id)
    merged.set(key, { ...item })
  }

  for (const item of guestItems) {
    const key = generateCartItemId(item.product_id, item.variant_id)
    if (merged.has(key)) {
      const existing = merged.get(key)!
      existing.quantity += item.quantity
    } else {
      merged.set(key, { ...item })
    }
  }

  return Array.from(merged.values())
}

async function syncGuestCartToDb(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  guestItems: CartItem[]
): Promise<CartItem[]> {
  if (guestItems.length === 0) return []

  // Find or create user cart
  const { data: existingCart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .is("session_id", null)
    .single()

  let cartId = existingCart?.id

  if (!cartId) {
    const { data: newCart } = await supabase
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single()
    cartId = newCart?.id
  }

  if (!cartId) return guestItems

  // Load existing DB cart items
  const { data: dbCartItems } = await supabase
    .from("cart_items")
    .select("id, product_id, variant_id, quantity, price_snapshot")
    .eq("cart_id", cartId)

  const dbItems: CartItem[] = (dbCartItems || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => ({
      id: item.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      name: "",
      price: item.price_snapshot,
      quantity: item.quantity,
    })
  )

  const merged = mergeCarts(guestItems, dbItems)

  // Replace DB cart items with merged items
  await supabase.from("cart_items").delete().eq("cart_id", cartId)

  for (const item of merged) {
    const price = item.price
    await supabase.from("cart_items").insert({
      cart_id: cartId,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      quantity: item.quantity,
      price_snapshot: price,
    })
  }

  return merged
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const isInitialLoad = useRef(true)
  const supabase = createClient()

  // Load cart on mount and subscribe to auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUserId = session?.user?.id ?? null

      if (event === "SIGNED_IN" && newUserId && !userId) {
        // User just logged in: merge guest cart into DB cart
        const guestItems = loadCart(GUEST_CART_KEY)

        if (guestItems.length > 0) {
          const merged = await syncGuestCartToDb(supabase, newUserId, guestItems)
          setItems(merged)
          clearGuestCart()
        } else {
          // No guest items - just load DB cart
          const { data: dbCartItems } = await supabase
            .from("cart_items")
            .select("id, product_id, variant_id, quantity, price_snapshot")
            .eq("cart_id", newUserId)

          if (dbCartItems && dbCartItems.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbItems: CartItem[] = dbCartItems.map((item: any) => ({
              id: item.id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              name: "",
              price: item.price_snapshot,
              quantity: item.quantity,
            }))
            setItems(dbItems)
          } else {
            setItems([])
          }
        }

        setUserId(newUserId)
        setIsLoading(false)
        isInitialLoad.current = false
        return
      }

      if (event === "SIGNED_OUT") {
        setUserId(null)
        const guestItems = loadCart(GUEST_CART_KEY)
        setItems(guestItems)
        setIsLoading(false)
        isInitialLoad.current = false
        return
      }

      if (isInitialLoad.current) {
        // First load: check session directly
        if (newUserId !== userId) {
          setUserId(newUserId)

          if (newUserId) {
            // Authenticated user: load DB cart
            const { data: dbCartItems } = await supabase
              .from("cart_items")
              .select("id, product_id, variant_id, quantity, price_snapshot")
              .eq("cart_id", newUserId)

            if (dbCartItems && dbCartItems.length > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const dbItems: CartItem[] = dbCartItems.map((item: any) => ({
                id: item.id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                name: "",
                price: item.price_snapshot,
                quantity: item.quantity,
              }))
              setItems(dbItems)
            } else {
              setItems([])
            }
          } else {
            // Guest: load from sessionStorage
            const cartKey = getCartKey(null)
            const loadedItems = loadCart(cartKey)
            setItems(loadedItems)
          }

          setIsLoading(false)
          isInitialLoad.current = false
        }
      }
    })

    // Fallback: if no auth event fires within 2s, load as guest
    const fallbackTimer = setTimeout(() => {
      if (isInitialLoad.current) {
        setUserId(null)
        const cartKey = getCartKey(null)
        const loadedItems = loadCart(cartKey)
        setItems(loadedItems)
        setIsLoading(false)
        isInitialLoad.current = false
      }
    }, 2000)

    return () => {
      clearTimeout(fallbackTimer)
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync cart to sessionStorage on every change (guest only)
  useEffect(() => {
    if (isLoading) return
    if (!userId) {
      const cartKey = getCartKey(null)
      saveCart(cartKey, items)
    }
  }, [items, userId, isLoading])

  const addItem = useCallback(
    (newItem: Omit<CartItem, "id">) => {
      setItems((prev) => {
        const key = generateCartItemId(newItem.product_id, newItem.variant_id)
        const existingIndex = prev.findIndex(
          (item) =>
            item.product_id === newItem.product_id &&
            item.variant_id === newItem.variant_id
        )

        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + newItem.quantity,
          }
          return updated
        }

        return [...prev, { ...newItem, id: key }]
      })
    },
    []
  )

  const removeItem = useCallback(
    (productId: string, variantId: string | null) => {
      setItems((prev) =>
        prev.filter(
          (item) =>
            !(item.product_id === productId && item.variant_id === variantId)
        )
      )
    },
    []
  )

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, variantId)
        return
      }
      setItems((prev) =>
        prev.map((item) =>
          item.product_id === productId && item.variant_id === variantId
            ? { ...item, quantity }
            : item
        )
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
