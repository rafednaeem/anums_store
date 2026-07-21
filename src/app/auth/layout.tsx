import Link from "next/link"
import Image from "next/image"
import { storeName } from "@/lib/constants"

const footerLinks = [
  { href: "/help", label: "Help" },
  { href: "/store-locator", label: "Store Locator" },
  { href: "/shipping-returns", label: "Shipping" },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const year = new Date().getFullYear()

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f4]">
      {/* Navbar — centered brand only */}
      <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-center bg-[#faf9f4]/80 px-5 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <Image
            src="/logo.png"
            alt={storeName}
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-heading text-xl font-semibold uppercase tracking-widest text-ethereal-dark sm:text-2xl">
            {storeName}
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center pt-20 px-5">
        {children}
      </main>

      {/* Footer — minimal */}
      <footer className="mt-auto py-12 px-5">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
            &copy; {year} {storeName}. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-ethereal-dark"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
