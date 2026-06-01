import { Metadata } from "next";
import { Suspense } from "react";
import { getProducts, ProductSort } from "@/lib/products";
import ReadyToWearClient from "./ReadyToWearClient";

export const metadata: Metadata = {
  title: "Ready to Wear Collection | Anums Store Lahore",
  description: "Shop ready-to-wear Pakistani fashion online. Kurtas, shalwar kameez, dupattas and more. Lahore-based brand, fast delivery.",
};

export default async function ReadyToWearPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : 0;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : 9999999;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort as ProductSort : "newest";
  const products = await getProducts({
    category: "ready-to-wear",
    minPrice,
    maxPrice,
    query,
    sort,
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-heading text-foreground mb-4">Ready-to-Wear</h1>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          Everyday elegance meets bold tradition. Explore our vibrant collection of ready-to-wear pieces designed for the modern Pakistani woman.
        </p>
      </div>

      <Suspense fallback={
        <div className="text-center py-12 text-foreground/65">
          Loading ready-to-wear collection...
        </div>
      }>
        <ReadyToWearClient products={products} />
      </Suspense>
    </div>
  );
}
