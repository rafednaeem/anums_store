import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { storeName, storeUrl } from "@/lib/constants"
import ProductCard from "@/components/store/ProductCard"

export const metadata: Metadata = {
  title: "Anums Store - Pakistani Fashion",
  description:
    "Discover curated Pakistani fashion — ready-to-wear, bridal, and accessories crafted with timeless elegance.",
  openGraph: {
    title: "Anums Store - Pakistani Fashion",
    description:
      "Discover curated Pakistani fashion — ready-to-wear, bridal, and accessories crafted with timeless elegance.",
    url: storeUrl,
    siteName: storeName,
    type: "website",
  },
}

const categories = [
  {
    title: "Ready-to-Wear",
    href: "/shop",
    description: "Elegant everyday pieces",
  },
  {
    title: "Bridal",
    href: "/bridal",
    description: "Timeless bridal collections",
  },
  {
    title: "Accessories",
    href: "/accessories",
    description: "Complete your look",
  },
]

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: storeName,
  url: storeUrl,
  description:
    "Curated Pakistani fashion — ready-to-wear, bridal, and accessories crafted with timeless elegance.",
  logo: `${storeUrl}/logo.png`,
  sameAs: [],
}

export default async function StoreHomePage() {
  const supabase = await createClient()

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*, category:categories(name, slug), product_images(image_url, is_primary, sort_order)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(8)

  const featured = (featuredProducts || []).map((p) => ({
    ...p,
    cover_url: p.cover_url || p.product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.image_url || p.product_images?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)?.[0]?.image_url || null,
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
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

      {/* Marquee Banner */}
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

      {/* Featured Products Section */}
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
          {featured.length > 0 ? (
            featured.map((product) => (
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

      {/* Category Cards */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-3xl font-bold text-ethereal-dark">
          Shop by Category
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group flex flex-col items-center rounded-lg border border-ethereal-silver/30 bg-white p-10 text-center shadow-sm transition-all hover:border-ethereal-maroon/30 hover:shadow-md"
            >
              <h3 className="font-heading text-xl font-semibold text-ethereal-dark group-hover:text-ethereal-maroon">
                {cat.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {cat.description}
              </p>
              <span className="mt-4 text-xs font-medium uppercase tracking-wider text-ethereal-maroon opacity-0 transition-opacity group-hover:opacity-100">
                Explore &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
