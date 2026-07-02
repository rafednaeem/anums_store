"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingBag, Truck } from "lucide-react"
import { useCart, type CartItem } from "@/hooks/useCart"
import { Button } from "@/components/ui/button"
import { formatPrice, calculateOrderTotals } from "@/lib/helpers"

export default function CartContent() {
  const { items, removeItem, updateQuantity, isLoading } = useCart()
  const router = useRouter()
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null)
  const clickTimerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const freeShippingThreshold = 10000
  const defaultShippingRate = 500

  const { subtotal, shipping, total } = calculateOrderTotals(
    items.map((i) => ({ price: i.price, quantity: i.quantity })),
    freeShippingThreshold,
    defaultShippingRate
  )

  const handleRemoveClick = useCallback(
    (item: CartItem) => {
      if (confirmingRemove === item.id) {
        if (clickTimerRef.current.has(item.id)) {
          clearTimeout(clickTimerRef.current.get(item.id)!)
          clickTimerRef.current.delete(item.id)
        }
        removeItem(item.product_id, item.variant_id)
        setConfirmingRemove(null)
        return
      }

      setConfirmingRemove(item.id)
      const timer = setTimeout(() => {
        setConfirmingRemove(null)
        clickTimerRef.current.delete(item.id)
      }, 2000)
      clickTimerRef.current.set(item.id, timer)
    },
    [confirmingRemove, removeItem]
  )

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ethereal-maroon border-t-transparent" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="mb-6 h-16 w-16 text-ethereal-silver" />
          <h1 className="font-heading text-3xl font-bold text-ethereal-dark">
            Your Cart is Empty
          </h1>
          <p className="mt-3 text-muted-foreground">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center rounded-md bg-ethereal-dark px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-ethereal-dark/90"
          >
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100)
  const amountToFreeShipping = freeShippingThreshold - subtotal

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-ethereal-dark">
        Shopping Cart
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"} in your cart
      </p>

      {shipping > 0 && amountToFreeShipping > 0 && (
        <div className="mt-6 rounded-lg border border-ethereal-silver/30 bg-ethereal-cream/50 p-4">
          <div className="flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 text-ethereal-maroon" />
            <span>
              Add <span className="font-semibold text-ethereal-maroon">{formatPrice(amountToFreeShipping)}</span> more for{" "}
              <span className="font-semibold text-ethereal-maroon">free shipping</span>!
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ethereal-silver/30">
            <div
              className="h-full rounded-full bg-ethereal-maroon transition-all duration-500"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>
      )}

      {shipping === 0 && (
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <Truck className="h-4 w-4" />
          <span>You qualify for <span className="font-semibold">free shipping</span>!</span>
        </div>
      )}

      <div className="mt-8 gap-8 lg:grid lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y rounded-lg border border-ethereal-silver/30 bg-white">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 sm:p-6">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-ethereal-cream sm:h-32 sm:w-32">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 96px, 128px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-ethereal-silver/50" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-ethereal-dark">{item.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-ethereal-dark">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-ethereal-silver/30">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product_id,
                            item.variant_id,
                            item.quantity - 1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center text-ethereal-dark transition-colors hover:bg-ethereal-cream"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="flex h-8 w-10 items-center justify-center border-x border-ethereal-silver/30 text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product_id,
                            item.variant_id,
                            item.quantity + 1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center text-ethereal-dark transition-colors hover:bg-ethereal-cream"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-ethereal-dark">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => handleRemoveClick(item)}
                        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                          confirmingRemove === item.id
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "text-muted-foreground hover:bg-ethereal-cream hover:text-red-600"
                        }`}
                        aria-label={
                          confirmingRemove === item.id
                            ? "Click again to confirm removal"
                            : "Remove item"
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                        {confirmingRemove === item.id ? "Confirm?" : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 lg:mt-0">
          <div className="sticky top-24 rounded-lg border border-ethereal-silver/30 bg-white p-6">
            <h2 className="font-heading text-xl font-bold text-ethereal-dark">
              Order Summary
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              <div className="border-t border-ethereal-silver/30 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-ethereal-dark">Total</span>
                  <span className="font-heading text-xl font-bold text-ethereal-dark">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => router.push("/checkout")}
              className="mt-6 w-full bg-ethereal-dark text-white hover:bg-ethereal-dark/90"
              size="lg"
            >
              Proceed to Checkout
            </Button>

            <Link
              href="/shop"
              className="mt-3 block text-center text-sm text-ethereal-maroon hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
