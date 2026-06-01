"use client";

import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { ProductListItem } from "@/lib/products";

export default function ReadyToWearClient({ products }: { products: ProductListItem[] }) {
  return (
    <ProductFilters productsCount={products.length}>
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
  );
}
