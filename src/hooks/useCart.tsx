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

function loadCart(key: string): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCart(key: string, items: CartItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    // Storage full or unavailable
  }
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

      if (newUserId !== userId) {
        if (isInitialLoad.current) {
          // First load: check session directly
          const {
            data: { user },
          } = await supabase.auth.getUser()
          const currentUserId = user?.id ?? null
          setUserId(currentUserId)

          const cartKey = getCartKey(currentUserId)
          const loadedItems = loadCart(cartKey)
          setItems(loadedItems)
          setIsLoading(false)
          isInitialLoad.current = false
        } else {
          // Auth state changed (login/logout)
          if (newUserId) {
            // User logged in: merge guest cart into DB cart
            setUserId(newUserId)

            const guestItems = loadCart(GUEST_CART_KEY)
            const dbItems = loadCart(getCartKey(newUserId))
            const merged = mergeCarts(guestItems, dbItems)

            setItems(merged)
            saveCart(getCartKey(newUserId), merged)
            localStorage.removeItem(GUEST_CART_KEY)
          } else {
            // User logged out: load guest cart
            setUserId(null)
            const guestItems = loadCart(GUEST_CART_KEY)
            setItems(guestItems)
          }
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

  // Sync cart to storage on every change
  useEffect(() => {
    if (isLoading) return
    const cartKey = getCartKey(userId)
    saveCart(cartKey, items)
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
