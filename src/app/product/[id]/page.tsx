import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.id);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `Buy ${product.name} Online | Anums Store Lahore`,
    description: product.description?.substring(0, 160) || undefined,
    openGraph: {
      title: `${product.name} - Buy Online at Anums Store`,
      description: product.description || undefined,
      images: product.images?.[0]
        ? [
            {
              url: product.images[0],
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductBySlug(params.id);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.categorySlug, product.slug.current);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images ?? [],
    description: product.description,
    sku: product.slug.current,
    brand: {
      "@type": "Brand",
      name: "Anums Store",
    },
    offers: {
      "@type": "Offer",
      url: `https://anumsstore.pk/product/${product.slug.current}`,
      priceCurrency: "PKR",
      price: product.price.toString(),
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Anums Store",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
