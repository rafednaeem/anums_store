"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"

interface WishlistItem {
  id: string
  product_id: string
}

interface WishlistContextValue {
  items: WishlistItem[]
  count: number
  addItem: (productId: string) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  isWishlisted: (productId: string) => boolean
  isLoading: boolean
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user?.id) {
        const { data } = await supabase
          .from("wishlists")
          .select("id, product_id")
          .eq("user_id", session.user.id)

        setItems(data ?? [])
        setIsLoading(false)
        return
      }

      if (event === "SIGNED_OUT") {
        setItems([])
        setIsLoading(false)
        return
      }
    })

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data } = await supabase
        .from("wishlists")
        .select("id, product_id")
        .eq("user_id", user.id)

      setItems(data ?? [])
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const addItem = useCallback(
    async (productId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("wishlists").insert({
        user_id: user.id,
        product_id: productId,
      })

      if (!error) {
        const { data } = await supabase
          .from("wishlists")
          .select("id, product_id")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .single()

        if (data) {
          setItems((prev) => [...prev, { id: data.id, product_id: productId }])
        }
      }
    },
    [supabase]
  )

  const removeItem = useCallback(
    async (productId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId)

      if (!error) {
        setItems((prev) => prev.filter((item) => item.product_id !== productId))
      }
    },
    [supabase]
  )

  const isWishlisted = useCallback(
    (productId: string) => items.some((item) => item.product_id === productId),
    [items]
  )

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        addItem,
        removeItem,
        isWishlisted,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}
