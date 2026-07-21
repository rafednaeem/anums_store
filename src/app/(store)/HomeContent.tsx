"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"

const demoProducts = [
  {
    id: "1",
    slug: "silk-chiffon-drapery",
    name: "Silk Chiffon Drapery",
    price: 45000,
    image: "/home/product-1.jpg",
    badge: "New Arrival",
  },
  {
    id: "2",
    slug: "gilded-artisan-kurta",
    name: "Gilded Artisan Kurta",
    price: 32500,
    image: "/home/product-2.jpg",
    badge: null,
  },
  {
    id: "3",
    slug: "terracotta-fusion-set",
    name: "Terracotta Fusion Set",
    price: 28900,
    image: "/home/product-3.jpg",
    badge: null,
  },
]

function formatPrice(price: number) {
  return `PKR ${price.toLocaleString()}`
}

export default function HomeContent({
  products,
}: {
  products?: Array<{
    id: string
    slug: string
    name: string
    price: number
    cover_url?: string | null
  }>
}) {
  const items = products?.length ? products : demoProducts
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
      <section className="relative h-[921px] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/home/hero.jpg"
            alt="Woman in contemporary Pakistani couture in a minimalist architectural space"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="relative z-10 px-5 md:px-16 max-w-4xl">
          <span className="font-label-caps text-[12px] tracking-[0.2em] text-white mb-4 block uppercase">
            Autumn Winter &apos;24
          </span>
          <h1 className="font-display-lg text-[64px] leading-[72px] tracking-[-0.02em] md:text-[84px] text-white mb-6">
            Curated Pakistani Fashion
          </h1>
          <p className="font-body-lg text-[18px] leading-[28px] text-white/90 max-w-xl mb-10">
            Discover collections that blend traditional artistry with modern
            silhouettes. Each piece is a testament to heritage craftsmanship
            reimagined for the contemporary woman.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop"
              className="bg-primary text-white font-button text-[14px] leading-[20px] tracking-[0.05em] px-10 py-4 uppercase hover:bg-primary/90 transition-all text-center"
            >
              Explore Collection
            </Link>
            <Link
              href="/shop"
              className="border border-white text-white font-button text-[14px] leading-[20px] tracking-[0.05em] px-10 py-4 uppercase hover:bg-white hover:text-black transition-all text-center"
            >
              View Lookbook
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Products ───────────────────────── */}
      <section className="py-[120px] px-5 md:px-16 max-w-[1440px] mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div className="max-w-xl">
            <h2 className="font-headline-lg text-[40px] leading-[48px] mb-4">
              The Seasonal Edit
            </h2>
            <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant">
              Handpicked essentials that define this season&apos;s aesthetic.
              Limited editions featuring exquisite hand-embellishments and
              premium fabrics.
            </p>
          </div>
          <Link
            href="/shop"
            className="font-label-caps text-[12px] tracking-[0.1em] border-b border-primary pb-1 hidden md:block uppercase"
          >
            View All Products
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.slice(0, 3).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] overflow-hidden bg-surface-container mb-6 relative">
                <Image
                  src={product.cover_url || product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {"badge" in product && product.badge && (
                  <div className="absolute top-4 left-4 bg-heritage-accent text-white font-label-caps text-[10px] px-3 py-1 uppercase">
                    {String(product.badge)}
                  </div>
                )}
              </div>
              <h3 className="font-body-lg text-[18px] leading-[28px] mb-1 group-hover:underline">
                {product.name}
              </h3>
              <p className="font-label-caps text-[12px] tracking-[0.1em] text-on-surface-variant">
                {"price" in product
                  ? formatPrice(product.price)
                  : ""}
              </p>
            </Link>
          ))}
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
