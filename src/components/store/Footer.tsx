import Link from "next/link"
import { storeName } from "@/lib/constants"

const footerLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/shipping-returns", label: "Shipping & Returns" },
  { href: "/contact", label: "Contact Us" },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <p className="font-heading text-xl font-semibold text-ethereal-dark">
              {storeName}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              &copy; {year} {storeName}. All rights reserved.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-6">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-ethereal-dark"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
