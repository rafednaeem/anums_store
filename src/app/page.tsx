import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Metadata } from "next";
import { getFeaturedProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Anums Store - Pakistani Fashion",
  description: "Ready-to-wear and bridal wear fashion from Lahore.",
};

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "Anums Store",
    image: "https://anumsstore.pk/logo.png",
    "@id": "https://anumsstore.pk",
    url: "https://anumsstore.pk",
    telephone: "+923224183457",
    address: {
      "@type": "PostalAddress",
      streetAddress: "MM Alam Road, Gulberg III",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      postalCode: "54000",
      addressCountry: "PK",
    },
  };

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "88vh" }}>
        {/* Gradient backdrop — replace with <Image> once a hero photo is available */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #B8D8D0 0%, #C8C4DC 35%, #E8D4CC 65%, #D0C8DC 100%)",
          }}
        />

        {/* Subtle fabric-like texture overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 7px)",
          }}
        />

        {/* Decorative arch shape on the right */}
        <div
          className="absolute right-0 top-0 h-full w-1/2 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 70% 90% at 85% 50%, rgba(155,154,200,0.5) 0%, transparent 70%)",
          }}
        />

        {/* Text content */}
        <div className="relative z-10 flex h-full items-end md:items-center px-8 md:px-16 lg:px-24 pb-16 md:pb-0" style={{ minHeight: "88vh" }}>
          <div className="max-w-lg">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.3em] text-foreground/60">
              Lahore Festive Collection
            </p>
            <h1 className="font-heading font-light leading-none mb-5 text-foreground"
                style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}>
              Ethereal<br />
              <em>Whispers</em>
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-foreground/65 max-w-sm">
              Discover the delicate interplay of heritage and modernity
              in our latest summer curation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/ready-to-wear"
                className="inline-block bg-ethereal-maroon px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.25em] text-white hover:bg-foreground transition-colors"
              >
                Shop Summer Collection
              </Link>
              <Link
                href="/bridal"
                className="inline-block border border-foreground/30 px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.25em] text-foreground/70 hover:border-foreground hover:text-foreground transition-colors"
              >
                Explore Bridal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ────────────────────────────────────── */}
      <div className="w-full overflow-hidden border-y border-ethereal-silver/30 bg-ethereal-cream py-2.5">
        <div className="inline-block animate-marquee whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.25em] text-foreground/50">
          <span className="mx-8">New Arrivals: Lahore Festive Collection</span>
          <span className="mx-2 text-ethereal-silver">·</span>
          <span className="mx-8">Free Shipping Across Pakistan on Orders Over Rs. 10,000</span>
          <span className="mx-2 text-ethereal-silver">·</span>
          <span className="mx-8">Custom Bridal Consultations Available</span>
          <span className="mx-2 text-ethereal-silver">·</span>
          <span className="mx-8">New Arrivals: Lahore Festive Collection</span>
          <span className="mx-2 text-ethereal-silver">·</span>
          <span className="mx-8">Free Shipping Across Pakistan on Orders Over Rs. 10,000</span>
          <span className="mx-2 text-ethereal-silver">·</span>
          <span className="mx-8">Custom Bridal Consultations Available</span>
          <span className="mx-2 text-ethereal-silver">·</span>
        </div>
      </div>

      {/* ── Season's Essentials ────────────────────────── */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-foreground mb-2">
              Season&apos;s Essentials
            </h2>
            <p className="text-sm text-foreground/50 tracking-wide">
              Soft textures and delicate details.
            </p>
          </div>
          <Link
            href="/all-products"
            className="text-[11px] uppercase tracking-[0.2em] text-foreground/50 hover:text-foreground transition-colors border-b border-current pb-0.5 self-start md:self-auto"
          >
            View All Products
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-3">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard
                key={product.slug.current}
                id={product.slug.current}
                name={product.name}
                price={product.price}
                comparePrice={product.comparePrice}
                rating={product.rating}
                reviewCount={product.reviewCount}
                inStock={product.inStock}
                quantity={product.quantity}
                image={
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : ""
                }
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="font-heading text-2xl font-light italic text-foreground/30">
                Products will appear here once Sanity is configured.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Category Cards ─────────────────────────────── */}
      <section className="border-t border-ethereal-silver/30 py-16 bg-ethereal-cream/60">
        <div className="container mx-auto px-6 grid grid-cols-1 gap-px sm:grid-cols-3 border border-ethereal-silver/30">
          {[
            { title: "Ready-to-Wear", copy: "Everyday pieces with polished tailoring.", href: "/ready-to-wear" },
            { title: "Bridal",        copy: "Custom wedding wear and formal ensembles.", href: "/bridal" },
            { title: "Personal Styling", copy: "Ask on WhatsApp before you order.", href: "/contact" },
          ].map(({ title, copy, href }) => (
            <Link
              key={title}
              href={href}
              className="group bg-ethereal-cream p-10 flex flex-col gap-3 hover:bg-white transition-colors"
            >
              <h3 className="font-heading text-2xl font-light text-foreground group-hover:text-ethereal-maroon transition-colors">
                {title}
              </h3>
              <p className="text-xs text-foreground/50 leading-relaxed tracking-wide">
                {copy}
              </p>
              <span className="mt-2 text-[10px] uppercase tracking-[0.2em] text-foreground/40 group-hover:text-ethereal-maroon transition-colors border-b border-current pb-0.5 self-start">
                Explore
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
