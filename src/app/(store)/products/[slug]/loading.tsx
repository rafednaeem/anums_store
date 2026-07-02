export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-4 w-48 animate-pulse rounded bg-ethereal-silver/30" />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Image skeleton */}
        <div className="space-y-4">
          <div className="aspect-[3/4] animate-pulse rounded-lg bg-ethereal-cream" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 w-20 animate-pulse rounded-md bg-ethereal-cream"
              />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-2/3 animate-pulse rounded bg-ethereal-silver/30" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-ethereal-silver/30" />
          <div className="h-6 w-1/4 animate-pulse rounded bg-ethereal-silver/30" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-ethereal-silver/30" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-ethereal-silver/30" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-ethereal-silver/30" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-16 animate-pulse rounded-md bg-ethereal-silver/30"
              />
            ))}
          </div>
          <div className="h-12 w-full animate-pulse rounded-md bg-ethereal-silver/30" />
        </div>
      </div>
    </div>
  )
}
