"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <span className="text-4xl">!</span>
        </div>
        <h1 className="mb-4 text-3xl font-heading text-ethereal-lavender">
          Couldn&apos;t load this product
        </h1>
        <p className="mb-8 text-foreground/70">
          We encountered an error while fetching this product. It may have been
          removed or there&apos;s a temporary issue.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="bg-ethereal-lavender px-8 py-3 font-bold tracking-widest text-ethereal-silver transition-colors hover:bg-ethereal-blush hover:text-white"
          >
            TRY AGAIN
          </button>
          <Link
            href="/all-products"
            className="border-2 border-ethereal-lavender px-8 py-3 font-bold tracking-widest text-ethereal-lavender transition-colors hover:border-ethereal-blush hover:text-ethereal-blush"
          >
            BROWSE PRODUCTS
          </Link>
        </div>
      </div>
    </div>
  );
}
