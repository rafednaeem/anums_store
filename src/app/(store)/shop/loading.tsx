import ProductGridSkeleton from "@/components/store/ProductGridSkeleton"

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="h-6 w-24 animate-pulse rounded bg-ethereal-silver/30" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-md bg-ethereal-silver/30" />
            ))}
          </div>
        </aside>
        <div className="flex-1">
          <div className="h-8 w-32 animate-pulse rounded bg-ethereal-silver/30" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-ethereal-silver/30" />
          <div className="mt-8">
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
