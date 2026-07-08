import Link from "next/link"

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="font-heading text-4xl font-bold text-ethereal-dark">
          404
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center rounded-md bg-ethereal-dark px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-ethereal-dark/90"
        >
          Browse Products
        </Link>
      </div>
    </div>
  )
}
