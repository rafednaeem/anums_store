"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, User, Heart, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import { storeName } from "@/lib/constants"
import { useCart } from "@/hooks/useCart"
import { useWishlist } from "@/hooks/useWishlist"
import CartDrawer from "./CartDrawer"

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/bridal", label: "Bridal" },
  { href: "/our-story", label: "Our Story" },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { totalItems } = useCart()
  const { count: wishlistCount } = useWishlist()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md transition-shadow",
        scrolled && "shadow-sm"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-ethereal-dark lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Desktop nav - left */}
        <nav className="hidden lg:flex lg:gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ethereal-dark transition-colors hover:text-ethereal-maroon"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Brand */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-heading text-xl font-semibold tracking-wide text-ethereal-dark sm:text-2xl"
        >
          {storeName}
        </Link>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          <Link
            href="/account"
            className="hidden rounded-md p-2 text-ethereal-dark transition-colors hover:bg-ethereal-cream sm:inline-flex"
            aria-label="Account"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/account/wishlist"
            className="relative hidden rounded-md p-2 text-ethereal-dark transition-colors hover:bg-ethereal-cream sm:inline-flex"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ethereal-maroon text-[10px] font-bold text-white">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>
          <CartDrawer itemCount={totalItems} />
        </div>
      </div>

      {/* Mobile slide-out drawer */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/40 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <span className="font-heading text-xl font-semibold text-ethereal-dark">
                {storeName}
              </span>
              <button
                type="button"
                className="rounded-md p-2 text-ethereal-dark hover:bg-ethereal-cream"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Mobile navigation">
              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-md px-3 py-2 text-base font-medium text-ethereal-dark transition-colors hover:bg-ethereal-cream hover:text-ethereal-maroon"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <hr className="my-6 border-ethereal-cream" />

              <ul className="space-y-1">
                <li>
                  <Link
                    href="/account"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-ethereal-dark transition-colors hover:bg-ethereal-cream"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" aria-hidden="true" />
                    Account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/wishlist"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-ethereal-dark transition-colors hover:bg-ethereal-cream"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="relative">
                      <Heart className="h-5 w-5" aria-hidden="true" />
                      {wishlistCount > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ethereal-maroon text-[10px] font-bold text-white">
                          {wishlistCount > 99 ? "99+" : wishlistCount}
                        </span>
                      )}
                    </span>
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-ethereal-dark transition-colors hover:bg-ethereal-cream"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                    Cart
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
