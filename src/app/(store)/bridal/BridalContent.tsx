"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

const heroStats = [
  { icon: "✦", label: "1,200 Artisanal Hours" },
  { icon: "✦", label: "Pure Mulberry Silk" },
]

const bentoItems = [
  {
    image: "/bridal/celestial-veil.jpg",
    alt: "Bride walking through minimalist white marble hall with trailing dupatta",
    label: "The Celestial Veil",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    image: "/bridal/master-craftsman.jpg",
    alt: "Artisan hands weaving gold threads into floral pattern on embroidery frame",
    label: "Master Craftsman at Work",
    span: "md:col-span-2 md:row-span-1",
  },
  {
    image: "/bridal/heritage-jewelry.jpg",
    alt: "Gold jhumkas and maang tikka on raw silk",
    label: "Heritage Jewelry",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    image: "/bridal/bridal-details.jpg",
    alt: "Henna-patterned hands holding delicate lace handkerchief",
    label: "Bridal Details",
    span: "md:col-span-1 md:row-span-1",
  },
]

export default function BridalContent() {
  const [heroScale, setHeroScale] = useState(1.05)
  const heroRef = useRef<HTMLDivElement>(null)

  // Parallax + scale on scroll
  useEffect(() => {
    function handleScroll() {
      const scroll = window.pageYOffset
      if (heroRef.current) {
        const img = heroRef.current.querySelector(".parallax-bg") as HTMLElement
        if (img) {
          img.style.transform = `translateY(${scroll * 0.4}px)`
        }
      }
      if (scroll < 400) {
        setHeroScale(1.05 - scroll * 0.000125)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Scroll reveal observer
  useEffect(() => {
    const els = document.querySelectorAll(".reveal-on-scroll")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active")
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* ── Hero Section ── */}
      <header
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div
            className="parallax-bg w-full h-full bg-cover bg-center transition-transform duration-[10s]"
            style={{
              backgroundImage: "url('/bridal/hero.jpg')",
              transform: `scale(${heroScale})`,
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="relative z-10 text-center px-4">
          <p className="mb-6 text-[12px] font-semibold uppercase tracking-[0.3em] text-white">
            The Heritage Collection
          </p>
          <h1 className="font-heading text-4xl italic text-white mb-12 md:text-[64px] md:leading-[72px]">
            Timeless Bridal
          </h1>
          <a
            href="#collections"
            className="inline-block bg-white px-10 py-4 text-[14px] font-medium uppercase tracking-widest text-ethereal-dark transition-all duration-500 hover:bg-ethereal-dark hover:text-white"
          >
            Explore The Collection
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="text-white text-2xl">↓</span>
        </div>
      </header>

      {/* ── Philosophy Section ── */}
      <section className="py-24 px-5 md:px-16 bg-[#faf9f4]">
        <div className="max-w-4xl mx-auto text-center reveal-on-scroll">
          <span className="mb-6 block text-[12px] font-semibold uppercase tracking-widest text-ethereal-maroon">
            Our Philosophy
          </span>
          <h2 className="font-heading text-[40px] leading-[48px] mb-8">
            A legacy woven in every thread, a story told in every stitch.
          </h2>
          <div className="w-16 h-px bg-border mx-auto mb-8" />
          <p className="text-lg leading-relaxed text-muted-foreground">
            At Anums Store, we believe bridal couture is more than attire; it is
            an heirloom. Our artisans spend hundreds of hours hand-crafting each
            piece, reviving centuries-old embroidery techniques like Zardosi and
            Gota work to create garments that transcend generations.
          </p>
        </div>
      </section>

      {/* ── Featured Masterpiece ── */}
      <section
        id="collections"
        className="py-24 px-5 md:px-16 bg-white overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Image */}
          <div className="md:col-span-7 reveal-on-scroll">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src="/bridal/masterpiece.jpg"
                alt="Detailed silver and pearl embroidery on deep crimson bridal gown"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-5 md:pl-16 reveal-on-scroll">
            <span className="mb-4 block text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
              The Crimson Muse
            </span>
            <h3 className="font-heading text-[40px] leading-[48px] mb-6">
              Velvet Noir &amp; Antique Silver
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground mb-8">
              Designed for the modern traditionalist, this ensemble features
              hand-crafted metallic threads and semi-precious stones embedded
              within deep silk velvet. A testament to the artistry of our master
              weavers.
            </p>

            <div className="flex flex-col gap-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 py-4 border-b border-border/30"
                >
                  <span className="text-ethereal-dark">{stat.icon}</span>
                  <span className="text-[12px] font-semibold uppercase tracking-[0.1em]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Grid Showcase ── */}
      <section className="py-24 px-5 md:px-16 bg-muted/30">
        <div className="mb-16 reveal-on-scroll">
          <h2 className="font-heading text-[40px] leading-[48px] text-center mb-2">
            The Art of Detail
          </h2>
          <p className="text-sm text-center uppercase tracking-widest text-muted-foreground">
            A closer look at our signature handicrafts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[1000px]">
          {bentoItems.map((item) => (
            <div
              key={item.label}
              className={`relative overflow-hidden group ${item.span}`}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                <p className="text-white text-[12px] font-semibold uppercase tracking-widest">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Consultation CTA ── */}
      <section className="relative py-40 flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/bridal/consultation-bg.jpg')",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[#faf9f4]/90 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 max-w-2xl text-center px-5 reveal-on-scroll">
          <h2 className="font-heading text-[40px] leading-[48px] mb-6">
            Begin Your Journey
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Every bride deserves a masterpiece. Schedule a private consultation
            with our lead designers to bring your vision to life.
          </p>

          <form
            className="flex flex-col gap-8 items-center"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative w-full">
                <label className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.1em] text-ethereal-dark">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="ALIZA MALIK"
                  className="w-full bg-transparent border-0 border-b border-ethereal-dark py-2 px-0 text-sm focus:outline-none focus:border-ethereal-maroon transition-colors placeholder:text-muted-foreground"
                />
              </div>
              <div className="relative w-full">
                <label className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.1em] text-ethereal-dark">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="ALIZA@EXAMPLE.COM"
                  className="w-full bg-transparent border-0 border-b border-ethereal-dark py-2 px-0 text-sm focus:outline-none focus:border-ethereal-maroon transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-ethereal-dark text-white px-12 py-4 text-[14px] font-medium uppercase tracking-widest transition-colors duration-300 hover:bg-ethereal-maroon"
            >
              Book A Consultation
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
