"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { calculateOrderTotals, FREE_SHIPPING_THRESHOLD } from "@/lib/orders";
import { useCartStore } from "@/store/useCartStore";

export default function CartPage() {
  const [confirmRemoveKey, setConfirmRemoveKey] = useState<string | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { items, removeItem, updateQuantity } = useCartStore();
  const { subtotal, shipping, total } = calculateOrderTotals(items);
  const freeShippingUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const requestRemove = (id: string, size: string | undefined) => {
    const key = `${id}-${size ?? "Default"}`;
    if (confirmRemoveKey === key) {
      removeItem(id, size);
      setConfirmRemoveKey(null);
      return;
    }

    setConfirmRemoveKey(key);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirmRemoveKey(null), 1500);
  };

  const decreaseQuantity = (id: string, size: string | undefined, quantity: number) => {
    if (quantity <= 1) {
      requestRemove(id, size);
      return;
    }
    updateQuantity(id, size, quantity - 1);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-ethereal-cream text-ethereal-maroon">
          <ShoppingBag className="h-9 w-9" />
        </div>
        <h1 className="font-heading text-4xl text-foreground">Your bag is empty.</h1>
        <p className="mt-2 max-w-md text-sm text-foreground/55">
          Discover our latest collections and add your favourites here.
        </p>
        <Link
          href="/all-products"
          className="mt-7 inline-flex items-center gap-2 bg-ethereal-maroon px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-foreground"
        >
          Shop now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-ethereal-blush">
            Shopping Bag
          </p>
          <h1 className="font-heading text-4xl text-foreground">Your Cart</h1>
        </div>
        <Link
          href="/all-products"
          className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/50 underline underline-offset-4 hover:text-ethereal-maroon"
        >
          Continue shopping
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="overflow-hidden border border-ethereal-silver/40 bg-white">
          <div className="hidden grid-cols-[1fr_170px_140px] bg-ethereal-maroon px-4 py-2 text-xs font-bold uppercase tracking-wider text-white md:grid">
            <span>Product</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Subtotal</span>
          </div>

          <div className="divide-y divide-ethereal-silver/30">
            {items.map((item) => {
              const key = `${item.id}-${item.size ?? "Default"}`;
              const confirming = confirmRemoveKey === key;

              return (
                <article
                  key={key}
                  className="grid gap-4 px-4 py-5 md:grid-cols-[1fr_170px_140px] md:items-center"
                >
                  <div className="flex gap-4">
                    <div className="relative h-28 w-20 flex-shrink-0 overflow-hidden bg-ethereal-cream">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] tracking-widest text-foreground/30">
                          Anums
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground">{item.name}</h2>
                      <p className="mt-1 text-xs text-foreground/45">Price: Rs. {item.price.toLocaleString()}</p>
                      <p className="mt-1 text-xs text-foreground/45">Size: {item.size ?? "Default"}</p>
                      <button
                        type="button"
                        onClick={() => requestRemove(item.id, item.size)}
                        className={`mt-2 inline-flex items-center gap-1 text-xs transition-colors ${
                          confirming ? "font-bold text-red-600" : "text-ethereal-maroon hover:text-red-600"
                        }`}
                      >
                        {!confirming && <Trash2 className="h-3 w-3" />}
                        {confirming ? "Remove?" : "Remove"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/45 md:hidden">
                      Quantity
                    </span>
                    <div className="grid grid-cols-[34px_46px_34px] overflow-hidden border border-ethereal-silver/60">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id, item.size, item.quantity)}
                        className={`flex h-9 items-center justify-center hover:bg-ethereal-cream ${
                          confirming ? "bg-red-50 text-red-600" : "text-foreground/65"
                        }`}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateQuantity(item.id, item.size, Number(event.target.value || 1))
                        }
                        className="h-9 border-x border-ethereal-silver/60 text-center text-sm font-bold outline-none"
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="flex h-9 items-center justify-center text-foreground/65 hover:bg-ethereal-cream"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:block md:text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/45 md:hidden">
                      Subtotal
                    </span>
                    <p className="text-sm font-bold text-foreground">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="self-start border border-ethereal-silver/40 bg-ethereal-cream p-5">
          <h2 className="font-heading text-2xl text-foreground">Order Summary</h2>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-foreground/60">
              <span>
                {freeShippingUnlocked
                  ? "Free shipping unlocked!"
                  : `Add Rs. ${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} more`}
              </span>
              <span>Rs. {FREE_SHIPPING_THRESHOLD.toLocaleString()}</span>
            </div>
            <div className="h-1 w-full rounded-full bg-ethereal-silver/20">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                  freeShippingUnlocked ? "bg-green-600" : "bg-ethereal-maroon"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/65">Subtotal</span>
              <span className="font-bold">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/65">Tax</span>
              <span className="font-bold">Rs. 0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/65">Shipping</span>
              <span className="font-bold">{shipping === 0 ? "Free" : `Rs. ${shipping.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between border-t border-ethereal-silver/50 pt-3 text-base">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-bold text-ethereal-maroon">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ethereal-maroon px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-foreground"
          >
            Proceed to checkout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
