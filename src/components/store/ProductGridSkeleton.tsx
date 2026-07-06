export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-ethereal-silver/30 bg-white"
        >
          <div className="aspect-[3/4] animate-pulse bg-ethereal-cream" />
          <div className="p-4 space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-ethereal-silver/30" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-ethereal-silver/30" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-ethereal-silver/30" />
          </div>
        </div>
      ))}
    </div>
  )
}
