import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import ShopContent from "./ShopContent"

export const metadata: Metadata = {
  title: "Shop | Anums Store",
  description:
    "Browse our curated collection of Pakistani fashion — ready-to-wear, bridal, and accessories crafted with timeless elegance.",
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const categorySlug =
    typeof params.category === "string" ? params.category : undefined

  let query = supabase
    .from("products")
    .select("*, category:categories(name, slug), product_images(image_url, is_primary, sort_order)")
    .eq("is_active", true)

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .eq("is_active", true)
      .single()

    if (cat) {
      query = query.eq("category_id", cat.id)
    }
  }

  const { data: products } = await query.order("created_at", { ascending: false })

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  return (
    <main className="pt-20 min-h-screen">
      {/* Hero Header */}
      <header className="pt-24 pb-16 px-5 md:px-16 text-center">
        <h1 className="font-heading text-4xl md:text-[64px] md:leading-[72px] text-ethereal-dark mb-4">
          The Collection
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the intersection of heritage craftsmanship and modern silhouettes.
          From handcrafted bridals to contemporary ready-to-wear essentials.
        </p>
      </header>

      <ShopContent
        products={products || []}
        categories={categories || []}
        activeCategory={categorySlug}
      />

      {/* Newsletter Section */}
      <section className="bg-muted py-24 px-5 md:px-16 text-center">
        <div className="max-w-xl mx-auto space-y-8">
          <h2 className="font-heading text-[40px] leading-[48px] text-ethereal-dark">
            Join the Inner Circle
          </h2>
          <p className="text-sm text-muted-foreground">
            Receive exclusive access to new collection launches, private viewing
            invitations, and editorial stories.
          </p>
          <form className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL"
              className="flex-grow bg-transparent border-b border-ethereal-dark py-3 px-1 text-xs font-semibold uppercase tracking-[0.1em] focus:outline-none focus:border-ethereal-maroon transition-colors placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="bg-ethereal-dark text-white px-10 py-4 text-xs font-medium uppercase tracking-widest hover:bg-ethereal-dark/90 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
