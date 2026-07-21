"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import ProductCard from "@/components/store/ProductCard"

export default function HomeContent({
  products,
}: {
  products?: Array<{
    id: string
    slug: string
    name: string
    price: number
    sale_price: number | null
    is_on_sale: boolean
    cover_url: string | null
    inventory_count: number
    category?: { name: string } | null
  }>
}) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active")
          }
        })
      },
      { threshold: 0.1 },
    )

    const els = document.querySelectorAll(".scroll-reveal")
    els.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <main ref={sectionRef} className="bg-background text-on-surface">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ethereal-cream via-white to-ethereal-cream">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-ethereal-maroon">
            New Season
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ethereal-dark sm:text-5xl lg:text-6xl">
            Curated Pakistani Fashion
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Discover collections that blend traditional artistry with modern
            silhouettes — crafted for the contemporary woman.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center rounded-md bg-ethereal-dark px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-ethereal-dark/90"
          >
            Shop Collection
          </Link>
        </div>
      </section>

      {/* ── Marquee Banner ──────────────────────────── */}
      <div className="overflow-hidden border-y bg-ethereal-dark py-3">
        <div className="animate-marquee flex whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="mx-8 text-xs font-medium uppercase tracking-widest text-white/80"
            >
              Free Shipping on Orders Over Rs. 5,000
              <span className="mx-4 text-ethereal-maroon">&#10022;</span>
              New Bridal Collection Now Available
              <span className="mx-4 text-ethereal-maroon">&#10022;</span>
              Handcrafted with Love
              <span className="mx-4 text-ethereal-maroon">&#10022;</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Featured Products ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-ethereal-dark">
            Featured
          </h2>
          <p className="mt-2 text-muted-foreground">
            Handpicked favourites from our latest collections.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-ethereal-silver/50 bg-ethereal-cream/30 py-20 text-center">
              <p className="text-sm text-muted-foreground">
                Products coming soon. Check back shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Shop by Category ───────────────────────── */}
      <section className="bg-surface-container-low py-[120px]">
        <div className="px-5 md:px-16 max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-on-surface-variant mb-4 block">
              Curated Portfolios
            </span>
            <h2 className="font-headline-lg text-[40px] leading-[48px]">
              Explore Our World
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px]">
            {/* Ready to Wear */}
            <Link
              href="/shop"
              className="md:col-span-8 group relative overflow-hidden h-[400px] md:h-full cursor-pointer"
            >
              <Image
                src="/home/category-rtw.jpg"
                alt="Woman in ready-to-wear linen ensemble in heritage courtyard"
                fill
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                sizes="(max-width: 768px) 100vw, 67vw"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-10 left-10 text-white">
                <h3 className="font-headline-md text-[28px] leading-[36px] mb-2">
                  Ready-to-Wear
                </h3>
                <p className="font-body-md text-[16px] leading-[24px] mb-6 opacity-80">
                  Everyday elegance redefined.
                </p>
                <span className="font-label-caps text-[12px] tracking-[0.1em] border-b border-white pb-1 uppercase">
                  Discover Now
                </span>
              </div>
            </Link>

            {/* Side Stack */}
            <div className="md:col-span-4 flex flex-col gap-6 h-full">
              <Link
                href="/bridal"
                className="flex-1 group relative overflow-hidden h-[400px] md:h-auto cursor-pointer"
              >
                <Image
                  src="/home/category-bridal.jpg"
                  alt="Bridal ensemble with gold filigree on crimson silk"
                  fill
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="font-headline-md text-[28px] leading-[36px] mb-1">
                    Bridal
                  </h3>
                  <span className="font-label-caps text-[12px] tracking-[0.1em] border-b border-white pb-1 uppercase">
                    Exquisite Craft
                  </span>
                </div>
              </Link>

              <Link
                href="/shop"
                className="flex-1 group relative overflow-hidden h-[400px] md:h-auto cursor-pointer"
              >
                <Image
                  src="/home/category-accessories.jpg"
                  alt="Velvet clutch and delicate gold jewelry on stone surface"
                  fill
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="font-headline-md text-[28px] leading-[36px] mb-1">
                    Accessories
                  </h3>
                  <span className="font-label-caps text-[12px] tracking-[0.1em] border-b border-white pb-1 uppercase">
                    The Finishing Touch
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Ethos ─────────────────────────────── */}
      <section className="py-[120px] px-5 md:px-16 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-[1px] bg-outline" />
          </div>
          <h2 className="font-headline-lg text-[40px] leading-[48px] mb-8 italic">
            &ldquo;Our story is woven into every stitch, bridging generations of
            artistry with the spirit of today.&rdquo;
          </h2>
          <p className="font-body-lg text-[18px] leading-[28px] text-on-surface-variant mb-12">
            Founded in the heart of Pakistan&apos;s rich textile heritage, Anums
            Store is dedicated to preserving the ancient techniques of
            hand-weaving, block printing, and needlework. By collaborating with
            local artisans, we ensure that every garment tells a story of skill,
            patience, and unparalleled beauty.
          </p>
          <Link
            href="/our-story"
            className="inline-block border border-primary text-primary font-button text-[14px] leading-[20px] tracking-[0.2em] px-12 py-4 uppercase hover:bg-primary hover:text-white transition-all duration-300"
          >
            Our Heritage
          </Link>
        </div>
      </section>
    </main>
  )
}
