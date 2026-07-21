import Link from "next/link"
import Image from "next/image"
import { cms } from "@/lib/cms"
import { storeName } from "@/lib/constants"

export default function Footer({ content = {} }: { content?: Record<string, string> }) {
  const year = new Date().getFullYear()

  const quickLinks = [
    { href: cms(content, "quick_links", "link_1_href", "/shop"), label: cms(content, "quick_links", "link_1_label", "Shop All") },
    { href: cms(content, "quick_links", "link_2_href", "/our-story"), label: cms(content, "quick_links", "link_2_label", "Our Story") },
    { href: cms(content, "quick_links", "link_3_href", "/contact"), label: cms(content, "quick_links", "link_3_label", "Contact Us") },
  ]

  const assistanceLinks = [
    { href: cms(content, "assistance", "link_1_href", "/privacy-policy"), label: cms(content, "assistance", "link_1_label", "Privacy Policy") },
    { href: cms(content, "assistance", "link_2_href", "/shipping-returns"), label: cms(content, "assistance", "link_2_label", "Shipping & Returns") },
  ]

  const logoUrl = cms(content, "brand", "logo_url", "/logo.png")
  const tagline = cms(content, "brand", "description", "Curating Pakistan\u2019s finest artisanal heritage for the modern wardrobe.")
  const copyright = cms(content, "bottom", "copyright", "All Rights Reserved.")
  const location1 = cms(content, "bottom", "location_1", "Lahore")
  const location2 = cms(content, "bottom", "location_2", "London")
  const location3 = cms(content, "bottom", "location_3", "Dubai")
  const quickLinksHeading = cms(content, "quick_links", "heading", "Quick Links")
  const assistanceHeading = cms(content, "assistance", "heading", "Assistance")

  return (
    <footer className="w-full py-[120px] px-5 md:px-16 flex flex-col items-center gap-8 bg-surface border-t border-outline-variant/30">
      <div className="flex flex-col md:flex-row justify-between w-full items-center md:items-start gap-12">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
            <Image
              src={logoUrl}
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
            {tagline}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 text-center md:text-left">
          <div className="flex flex-col gap-4">
            <span className="font-label-caps text-[12px] tracking-[0.1em] text-primary uppercase">
              {quickLinksHeading}
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
              {assistanceHeading}
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
          &copy; {year} {storeName}. {copyright}
        </span>
        <div className="flex gap-8">
          {location1 && (
            <span className="font-label-caps text-[10px] text-on-surface-variant opacity-50 uppercase">
              {location1}
            </span>
          )}
          {location2 && (
            <span className="font-label-caps text-[10px] text-on-surface-variant opacity-50 uppercase">
              {location2}
            </span>
          )}
          {location3 && (
            <span className="font-label-caps text-[10px] text-on-surface-variant opacity-50 uppercase">
              {location3}
            </span>
          )}
        </div>
      </div>
    </footer>
  )
}
