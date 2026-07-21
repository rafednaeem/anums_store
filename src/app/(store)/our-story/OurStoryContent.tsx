"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

const valueProps = [
  {
    title: "Ethical Sourcing",
    description:
      "We ensure fair living wages and safe working environments for all our partner artisans, fostering community growth and dignity.",
  },
  {
    title: "Timeless Design",
    description:
      "Our aesthetic transcends seasons. We create investment pieces designed to be cherished and passed down through generations.",
  },
  {
    title: "Sustainable Future",
    description:
      "By prioritizing natural fibers and traditional low-impact methods, we minimize our ecological footprint on the planet.",
  },
]

export default function OurStoryContent() {
  const heroRef = useRef<HTMLDivElement>(null)

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

    const els = document.querySelectorAll(".reveal-on-scroll")
    els.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <main className="bg-background text-on-surface">
      {/* ── Hero ────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-[120px] px-5 md:px-16 min-h-[921px] flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center max-w-[1440px] mx-auto">
          {/* Text */}
          <div className="md:col-span-5 order-2 md:order-1">
            <span className="block font-label-caps text-[12px] tracking-[0.1em] text-heritage-accent mb-6 uppercase">
              Heritage &amp; Modernity
            </span>
            <h2 className="font-display-lg text-[64px] leading-[72px] tracking-[-0.02em] mb-8">
              Handcrafted with Love
            </h2>
            <p className="font-body-lg text-[18px] leading-[28px] text-on-surface-variant mb-10 max-w-md">
              Our journey began with a simple vision: to preserve the dying arts
              of traditional Pakistani craftsmanship while elevating them for the
              modern global stage.
            </p>
            <div className="h-px w-32 bg-black/10 mb-10" />
            <p className="font-body-md text-[16px] leading-[24px] italic text-on-surface/60">
              Founded in Lahore, 2024.
            </p>
          </div>

          {/* Image */}
          <div className="md:col-span-7 order-1 md:order-2 mb-12 md:mb-0">
            <div className="relative aspect-[4/5] md:aspect-[16/10] overflow-hidden group">
              <Image
                src="/our-story/hero.jpg"
                alt="Master craftsman's hands embroidering gold threads on luxurious off-white silk"
                fill
                className="object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-1000"
                sizes="(max-width: 768px) 100vw, 58vw"
                priority
              />
              <div className="absolute bottom-6 right-6 text-white bg-black/20 backdrop-blur-sm px-4 py-2">
                <span className="font-label-caps text-[10px] tracking-[0.2em] uppercase">
                  Master Craftsman at Work
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Narrative: The Artisans ────────────────── */}
      <section className="py-[120px] bg-surface-container-low">
        <div className="px-5 md:px-16">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[120px] items-center">
              <div className="reveal-on-scroll">
                <div className="aspect-[3/4] overflow-hidden">
                  <Image
                    src="/our-story/artisan-blocks.jpg"
                    alt="Wooden blocks for block printing stained with indigo and ochre dyes"
                    width={800}
                    height={1067}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="reveal-on-scroll">
                <h3 className="font-headline-lg text-[40px] leading-[48px] mb-8">
                  Traditional Artistry
                </h3>
                <p className="font-body-lg text-[18px] leading-[28px] text-on-surface-variant mb-6">
                  Every garment at Anums Store tells a story of patience. We work
                  exclusively with fourth-generation artisans who have mastered
                  the intricate techniques of hand-loom weaving and block
                  printing.
                </p>
                <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant">
                  Unlike mass-produced fashion, our pieces are born from the
                  rhythmic sound of the loom and the careful placement of the
                  block. This deliberate slowness is our protest against the
                  transience of modern trends.
                </p>
                <button className="mt-10 px-8 py-4 border border-primary font-button text-[14px] leading-[20px] tracking-[0.05em] uppercase hover:bg-primary hover:text-white transition-all duration-300">
                  Meet the Artisans
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Grid: The Process ────────────────── */}
      <section className="py-[120px] px-5 md:px-16">
        <div className="text-center mb-[120px] max-w-2xl mx-auto reveal-on-scroll">
          <span className="block font-label-caps text-[12px] tracking-[0.1em] text-heritage-accent mb-4 uppercase">
            Our Process
          </span>
          <h2 className="font-headline-lg text-[40px] leading-[48px] mb-6">
            Honoring the Material
          </h2>
          <div className="h-px w-16 bg-black/10 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Large Focus */}
          <div className="md:col-span-8 reveal-on-scroll">
            <div className="relative group h-[500px] overflow-hidden">
              <Image
                src="/our-story/natural-dyeing.jpg"
                alt="Wide shot of raw cotton yarns being dyed in copper vats with natural indigo"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 67vw"
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute bottom-10 left-10 text-white max-w-sm">
                <p className="font-label-caps text-[12px] tracking-[0.1em] mb-2 opacity-80 uppercase">
                  Phase 01
                </p>
                <h4 className="font-headline-md text-[28px] leading-[36px] mb-4">
                  Natural Dyeing
                </h4>
                <p className="font-body-md text-[16px] leading-[24px] opacity-90">
                  We source our pigments from roots, barks, and minerals,
                  ensuring a vibrant palette that respects the earth.
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Details */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div
              className="relative h-[238px] overflow-hidden reveal-on-scroll"
              style={{ transitionDelay: "100ms" }}
            >
              <Image
                src="/our-story/silk-thread.jpg"
                alt="Needle pulling silver thread through translucent silk organza"
                fill
                className="object-cover"
                sizes="33vw"
              />
              <div className="absolute top-4 left-4 bg-white/80 px-2 py-1">
                <span className="font-label-caps text-[10px] text-primary uppercase">
                  Detail View
                </span>
              </div>
            </div>
            <div
              className="relative h-[238px] overflow-hidden reveal-on-scroll"
              style={{ transitionDelay: "200ms" }}
            >
              <Image
                src="/our-story/raw-fibers.jpg"
                alt="Raw silk, pashmina wool, and organic cotton laid on white linen"
                fill
                className="object-cover"
                sizes="33vw"
              />
              <div className="absolute top-4 left-4 bg-white/80 px-2 py-1">
                <span className="font-label-caps text-[10px] text-primary uppercase">
                  Foundations
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote ──────────────────────────────────── */}
      <section className="py-[120px] bg-primary text-on-primary">
        <div className="px-5 md:px-16 text-center reveal-on-scroll">
          <blockquote className="max-w-4xl mx-auto">
            <p className="font-display-lg text-[64px] leading-[72px] tracking-[-0.02em] italic mb-10 px-4 md:px-0">
              &ldquo;We don&apos;t just create clothes; we preserve a legacy of
              hands that have spent lifetimes perfecting the art of
              beauty.&rdquo;
            </p>
            <footer className="font-label-caps text-[12px] tracking-[0.1em] uppercase opacity-60">
              — Anum Rashid, Founder
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ── Value Propositions ─────────────────────── */}
      <section className="py-[120px] px-5 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {valueProps.map((item, i) => (
            <div
              key={item.title}
              className="reveal-on-scroll"
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="h-px w-12 bg-black/10 mb-8" />
              <h5 className="font-headline-md text-[28px] leading-[36px] mb-4">
                {item.title}
              </h5>
              <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
