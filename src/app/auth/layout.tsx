import Link from "next/link"
import { User, ShoppingBag } from "lucide-react"
import { storeName } from "@/lib/constants"

const footerLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/shipping-returns", label: "Shipping & Returns" },
  { href: "/contact", label: "Contact Us" },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const year = new Date().getFullYear()

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f4]">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-border/30 bg-[#faf9f4]/80 px-5 backdrop-blur-md md:px-16">
        <Link
          href="/"
          className="font-heading text-xl font-semibold uppercase tracking-widest text-ethereal-dark sm:text-2xl"
        >
          {storeName}
        </Link>
        <div className="hidden gap-8 md:flex">
          <Link
            href="/shop"
            className="text-sm text-muted-foreground transition-opacity hover:opacity-70"
          >
            Shop
          </Link>
          <Link
            href="/bridal"
            className="text-sm text-muted-foreground transition-opacity hover:opacity-70"
          >
            Bridal
          </Link>
          <Link
            href="/our-story"
            className="text-sm text-muted-foreground transition-opacity hover:opacity-70"
          >
            Our Story
          </Link>
        </div>
        <div className="flex gap-4">
          <Link
            href="/account"
            className="text-ethereal-dark transition-opacity hover:opacity-70"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="text-ethereal-dark transition-opacity hover:opacity-70"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-5 pt-24 pb-12 md:px-0">
        <div className="w-full max-w-[440px] border border-primary/10 bg-white p-10 md:p-12">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/30 bg-[#faf9f4] py-12 px-5 md:px-16">
        <div className="flex flex-col items-center gap-8">
          <nav className="flex flex-wrap justify-center gap-8">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-ethereal-maroon"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {year} {storeName}. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
