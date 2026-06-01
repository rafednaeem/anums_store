import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, size?: string) => void
  updateQuantity: (id: string, size: string | undefined, quantity: number) => void
  clearCart: () => void
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === newItem.id && item.size === newItem.size
          )
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id && item.size === newItem.size
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            }
          }
          return { items: [...state.items, newItem] }
        })
      },
      removeItem: (id, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === id && item.size === size)
          ),
        }))
      },
      updateQuantity: (id, size, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id && item.size === size
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        }))
      },
      clearCart: () => set({ items: [] }),
      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'anums-store-cart',
    }
  )
)
