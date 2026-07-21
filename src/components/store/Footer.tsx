import Link from "next/link"
import Image from "next/image"
import { storeName } from "@/lib/constants"

const quickLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/our-story", label: "Our Story" },
  { href: "/contact", label: "Contact Us" },
]

const assistanceLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/shipping-returns", label: "Shipping & Returns" },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full py-[120px] px-5 md:px-16 flex flex-col items-center gap-8 bg-surface border-t border-outline-variant/30">
      <div className="flex flex-col md:flex-row justify-between w-full items-center md:items-start gap-12">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
            <Image
              src="/logo.png"
              alt={storeName}
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h2 className="font-headline-md text-[28px] leading-[36px] text-primary uppercase tracking-[0.4em]">
              {storeName}
            </h2>
          </div>
          <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant max-w-xs">
            Curating Pakistan&apos;s finest artisanal heritage for the modern
            wardrobe.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 text-center md:text-left">
          <div className="flex flex-col gap-4">
            <span className="font-label-caps text-[12px] tracking-[0.1em] text-primary uppercase">
              Quick Links
            </span>
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body-md text-[16px] leading-[24px] text-on-surface-variant hover:text-heritage-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-label-caps text-[12px] tracking-[0.1em] text-primary uppercase">
              Assistance
            </span>
            {assistanceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body-md text-[16px] leading-[24px] text-on-surface-variant hover:text-heritage-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-black/10 my-8" />

      <div className="flex flex-col md:flex-row justify-between w-full items-center gap-4">
        <span className="font-body-md text-[16px] leading-[24px] text-on-surface-variant opacity-70">
          &copy; {year} {storeName}. All Rights Reserved.
        </span>
        <div className="flex gap-8">
          <span className="font-label-caps text-[10px] text-on-surface-variant opacity-50 uppercase">
            Lahore
          </span>
          <span className="font-label-caps text-[10px] text-on-surface-variant opacity-50 uppercase">
            London
          </span>
          <span className="font-label-caps text-[10px] text-on-surface-variant opacity-50 uppercase">
            Dubai
          </span>
        </div>
      </div>
    </footer>
  )
}
