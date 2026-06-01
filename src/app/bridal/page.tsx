import { Metadata } from "next";
import { Suspense } from "react";
import { getProducts, ProductSort } from "@/lib/products";
import BridalClient from "./BridalClient";

export const metadata: Metadata = {
  title: "Bridal Collection — Lehengas & Wedding Wear | Anums Store",
  description: "Bridal lehengas, gharara sets and wedding wear from Lahore. Custom sizing available. Browse the Anums Store bridal collection.",
};

export default async function BridalPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : 0;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : 9999999;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const occasion = typeof searchParams.occasion === "string" ? searchParams.occasion : "";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort as ProductSort : "newest";
  const products = await getProducts({
    category: "bridal",
    occasion,
    minPrice,
    maxPrice,
    query,
    sort,
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-heading text-foreground mb-4">Bridal Edit</h1>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          Timeless artistry for your most cherished moments. Exquisite hand-embellished ensembles crafted for the modern bride.
        </p>
      </div>

      <Suspense fallback={
        <div className="text-center py-12 text-foreground/65">
          Loading bridal collection...
        </div>
      }>
        <BridalClient products={products} />
      </Suspense>
    </div>
  );
}
