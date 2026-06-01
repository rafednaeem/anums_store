"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";

interface ProductFiltersProps {
  productsCount: number;
  showOccasion?: boolean;
  children: ReactNode;
}

export default function ProductFilters({ productsCount, showOccasion = false, children }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  const pushParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handlePriceChange = (min: string, max: string) => {
    pushParams({ minPrice: min, maxPrice: max });
  };

  const activePriceRange =
    searchParams.get("minPrice") === "0" && searchParams.get("maxPrice") === "10000" ? "under-10k" :
    searchParams.get("minPrice") === "10000" && searchParams.get("maxPrice") === "20000" ? "10k-20k" :
    searchParams.get("minPrice") === "20000" ? "over-20k" : "all";

  const activeOccasion = searchParams.get("occasion") || "all";

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <aside className="w-full flex-shrink-0 lg:w-64">
        <div className="sticky top-24 border-2 border-ethereal-silver bg-white/70 p-6 shadow-sm backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-2 border-b-2 border-ethereal-maroon pb-2 text-xl font-heading text-foreground">
            <SlidersHorizontal className="h-5 w-5" />
            <h2>Filters</h2>
          </div>

          <form
            className="mb-6"
            onSubmit={(event) => {
              event.preventDefault();
              pushParams({ q: search });
            }}
          >
            <label className="mb-2 block text-sm font-bold uppercase tracking-wider">Search</label>
            <div className="flex border-2 border-gray-300 focus-within:border-ethereal-mint">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
              />
              <button className="px-3 text-foreground hover:text-ethereal-maroon" aria-label="Search products">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {showOccasion && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Occasion</h3>
              {[
                ["all", "All", ""],
                ["nikkah", "Nikkah", "nikkah"],
                ["walima", "Walima", "walima"],
                ["mehndi", "Mehndi", "mehndi"],
                ["barat", "Barat", "barat"],
              ].map(([key, label, value]) => (
                <label key={key} className="mb-2 flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-ethereal-maroon">
                  <input
                    type="radio"
                    name="occasion"
                    className="accent-ethereal-blush"
                    checked={activeOccasion === key}
                    onChange={() => pushParams({ occasion: value })}
                  />
                  {label}
                </label>
              ))}
            </div>
          )}

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Price</h3>
            {[
              ["all", "All Prices", "", ""],
              ["under-10k", "Under Rs. 10,000", "0", "10000"],
              ["10k-20k", "Rs. 10,000 - Rs. 20,000", "10000", "20000"],
              ["over-20k", "Over Rs. 20,000", "20000", ""],
            ].map(([key, label, min, max]) => (
              <label key={key} className="mb-2 flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-ethereal-maroon">
                <input
                  type="radio"
                  name="price"
                  className="accent-ethereal-blush"
                  checked={activePriceRange === key}
                  onChange={() => handlePriceChange(min, max)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-grow">
        <div className="mb-6 flex flex-col justify-between gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center">
          <span className="text-sm text-gray-500">{productsCount} Products</span>
          <select
            className="border-2 border-ethereal-silver bg-transparent p-2 text-sm outline-none focus:border-ethereal-maroon"
            value={searchParams.get("sort") || "newest"}
            onChange={(event) => pushParams({ sort: event.target.value })}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
        {children}
      </div>
    </div>
  );
}
