import Link from "next/link";
import Image from "next/image";
import WishlistButton from "./WishlistButton";

interface ProductProps {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  quantity?: number;
  image: string;
}

export default function ProductCard({
  id, name, price, comparePrice, rating, reviewCount, inStock = true, quantity, image,
}: ProductProps) {
  const hasDiscount = comparePrice && comparePrice > price;
  const lowStock   = inStock && quantity !== undefined && quantity > 0 && quantity <= 5;

  return (
    <Link href={`/product/${id}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#EDE9E4] mb-4">
        {hasDiscount && (
          <span className="absolute left-3 top-3 z-20 bg-ethereal-maroon px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white">
            Sale
          </span>
        )}
        {!inStock && (
          <span className="absolute right-3 top-3 z-20 bg-foreground/80 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white">
            Sold Out
          </span>
        )}
        {lowStock && inStock && (
          <span className="absolute right-3 top-3 z-20 bg-ethereal-blush/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white">
            Only {quantity} left
          </span>
        )}
        <WishlistButton item={{ id, name, price, image }} />
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-103 transition-transform duration-700 ease-in-out"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-ethereal-silver/30 to-ethereal-lavender/20 flex items-center justify-center">
            <span className="font-heading text-2xl font-light tracking-widest text-foreground/30 italic">
              Anums
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center px-2">
        <h3 className="font-body text-sm tracking-wide text-foreground group-hover:text-ethereal-maroon transition-colors">
          {name}
        </h3>
        <div className="mt-1.5 flex items-center justify-center gap-2">
          <p className="text-sm text-foreground/70">
            Rs.&nbsp;{price.toLocaleString()}
          </p>
          {hasDiscount && (
            <p className="text-xs text-foreground/35 line-through">
              Rs.&nbsp;{comparePrice.toLocaleString()}
            </p>
          )}
        </div>
        {rating ? (
          <p className="mt-1 text-[11px] text-foreground/40 tracking-wide">
            {rating.toFixed(1)} / 5{reviewCount ? ` (${reviewCount})` : ""}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
