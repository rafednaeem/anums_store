import { Metadata } from "next";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { getProducts, ProductSort } from "@/lib/products";


export const metadata: Metadata = {
  title: "All Products | Anums Store",
  description: "Browse all ready-to-wear, bridal, accessories and seasonal products from Anums Store.",
};

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : 0;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : 9999999;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort as ProductSort : "newest";
  const products = await getProducts({ minPrice, maxPrice, query, sort });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-heading text-foreground md:text-5xl">All Products</h1>
        <p className="mx-auto max-w-2xl text-foreground/70">
          Explore every active Anums Store product in one place, with search, price filters, stock status, and sorting.
        </p>
      </div>

      <Suspense fallback={
        <div className="text-center py-12 text-foreground/65">
          Loading products...
        </div>
      }>
        <ProductFilters productsCount={products.length} showOccasion>
          {products.length === 0 ? (
            <div className="py-24 text-center text-gray-500">
              No products found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 md:gap-8">
              {products.map((product) => (
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
                  image={product.images && product.images.length > 0 ? product.images[0] : ""}
                />
              ))}
            </div>
          )}
        </ProductFilters>
      </Suspense>
    </div>
  );
}
