"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Menu, X } from "lucide-react";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Ready-to-Wear", href: "/ready-to-wear" },
    { name: "Bridal",        href: "/bridal" },
    { name: "All Products",  href: "/all-products" },
    { name: "Our Story",     href: "/our-story" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-ethereal-cream/90 backdrop-blur-sm border-b border-ethereal-silver/30">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1 md:hidden text-foreground/70 hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand */}
        <Link
          href="/"
          className="font-heading text-xl font-light tracking-[0.35em] uppercase text-foreground"
        >
          Anums Store
        </Link>

        {/* Desktop nav — centred */}
        <nav className="hidden md:flex gap-10 text-[11px] font-medium tracking-[0.2em] uppercase absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/70 hover:text-foreground transition-colors hover:underline underline-offset-4 decoration-ethereal-blush"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="p-1 text-foreground/70 hover:text-foreground transition-colors"
            aria-label="Account"
          >
            <User className="w-4 h-4" />
          </Link>
          <CartDrawer />
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-[100] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-72 bg-ethereal-cream z-[110] shadow-xl md:hidden flex flex-col">
            <div className="flex items-center justify-between px-6 h-14 border-b border-ethereal-silver/30">
              <span className="font-heading text-lg font-light tracking-[0.3em] uppercase">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col px-6 pt-8 gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-heading text-2xl font-light tracking-wider text-foreground/80 hover:text-ethereal-maroon transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="mt-auto px-6 pb-8 border-t border-ethereal-silver/30 pt-6">
              <p className="font-heading text-sm font-light tracking-widest uppercase text-foreground/40">
                Lahore, Pakistan
              </p>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
