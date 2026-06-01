"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageCircle, ShoppingCart, Heart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { toast } from "react-hot-toast";
import ProductCard from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";
import SizeGuideSection from "@/components/SizeGuideSection";
import { ProductDetailItem, ProductListItem } from "@/lib/products";

export default function ProductDetailClient({ product, relatedProducts }: { product: ProductDetailItem, relatedProducts: ProductListItem[] }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.slug.current));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);

  const isOutOfStock = !product.inStock || (product.quantity !== undefined && product.quantity <= 0);
  const lowStock = product.inStock && product.quantity !== undefined && product.quantity > 0 && product.quantity <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("This product is out of stock.");
      return;
    }
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast.error("Please select a size first.");
      return;
    }
    addItem({
      id: product.slug.current,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: selectedSize || "Default",
      image: product.images && product.images.length > 0 ? product.images[0] : ""
    });
    toast.success("Added to cart!");
  };

  const whatsappMessage = encodeURIComponent(`Hi Anums Store, I'm interested in the ${product.name} (Rs. ${product.price}). Can you share more details? https://anumsstore.pk/product/${product.slug.current}`);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Image Gallery */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="aspect-[4/5] bg-gray-200 relative border-2 border-ethereal-silver overflow-hidden">
             {product.images && product.images.length > 0 ? (
               <Image
                 src={product.images[selectedImageIndex]}
                 alt={product.name}
                 fill
                 className="object-cover"
                 priority
                 unoptimized
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-500 font-heading text-2xl bg-gradient-to-br from-ethereal-mint to-ethereal-dark">
                 Anums Store
               </div>
             )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, i: number) => (
                <div 
                  key={i} 
                  className={`w-24 h-32 relative bg-gray-200 flex-shrink-0 border-2 cursor-pointer transition-colors overflow-hidden ${selectedImageIndex === i ? "border-ethereal-maroon" : "hover:border-ethereal-silver border-transparent"}`}
                  onClick={() => setSelectedImageIndex(i)}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - image ${i + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-4xl font-heading text-foreground mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <p className="text-2xl text-ethereal-maroon">Rs. {product.price.toLocaleString()}</p>
            {product.comparePrice && (
              <p className="text-xl text-gray-400 line-through">Rs. {product.comparePrice.toLocaleString()}</p>
            )}
          </div>
          
          <div className="mb-8">
            <p className="text-foreground/80 leading-relaxed">{product.description}</p>
          </div>

          {lowStock && (
            <p className="mb-4 text-sm font-bold text-amber-600">
              Only {product.quantity} left in stock — order soon
            </p>
          )}
          {isOutOfStock && (
            <p className="mb-4 text-sm font-bold text-red-600">
              Currently out of stock
            </p>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold uppercase tracking-wider text-sm mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border-2 flex items-center justify-center transition-colors font-bold ${
                      selectedSize === size
                        ? "border-ethereal-maroon bg-ethereal-maroon text-white"
                        : "border-gray-300 hover:border-ethereal-silver"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 font-bold py-4 uppercase tracking-widest flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-lg ${
                !isOutOfStock
                  ? "bg-ethereal-maroon text-ethereal-silver hover:bg-ethereal-maroon hover:text-white" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-5 h-5" /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={() => {
                toggleWishlist({
                  id: product.slug.current,
                  name: product.name,
                  price: product.price,
                  image: product.images && product.images.length > 0 ? product.images[0] : "",
                });
                toast(isInWishlist ? "Removed from wishlist" : "Added to wishlist");
              }}
              className={`flex items-center justify-center gap-2 border-2 py-4 font-bold uppercase tracking-widest transition-all hover:-translate-y-1 shadow-lg ${
                isInWishlist
                  ? "border-ethereal-maroon bg-ethereal-maroon/10 text-ethereal-maroon"
                  : "border-gray-300 text-gray-500 hover:border-ethereal-maroon hover:text-ethereal-maroon"
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? "fill-ethereal-maroon" : ""}`} />
              {isInWishlist ? "Saved" : "Wishlist"}
            </button>
            <a 
              href={`https://wa.me/923224183457?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white font-bold py-4 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-all transform hover:-translate-y-1 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" /> Ask on WhatsApp
            </a>
          </div>

          {product.details && product.details.length > 0 && (
            <div className="border-t border-gray-200 py-6">
              <h3 className="font-bold uppercase tracking-wider text-sm mb-4 text-foreground">Product Details</h3>
              <ul className="list-disc list-inside text-sm text-foreground/70 space-y-2">
                {product.details.map((detail: string, idx: number) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="container mx-auto max-w-3xl">
        <ReviewSection productId={product.slug.current} />
      </div>

      {/* Size Guide */}
      {product.category && (
        <div className="container mx-auto max-w-3xl">
          <SizeGuideSection category={product.category} />
        </div>
      )}

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-24 border-t-2 border-ethereal-maroon pt-16">
          <h2 className="text-3xl font-heading text-foreground mb-12">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard 
                key={p.slug.current} 
                id={p.slug.current} 
                name={p.name} 
                price={p.price} 
                comparePrice={p.comparePrice}
                rating={p.rating}
                reviewCount={p.reviewCount}
                inStock={p.inStock}
                image={p.images && p.images.length > 0 ? p.images[0] : ""} 
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
