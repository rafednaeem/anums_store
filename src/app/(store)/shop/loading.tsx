import ProductGridSkeleton from "@/components/store/ProductGridSkeleton"

export default function ShopLoading() {
  return (
    <main className="pt-20 min-h-screen">
      {/* Hero Skeleton */}
      <header className="pt-24 pb-16 px-5 md:px-16 text-center">
        <div className="h-12 w-64 mx-auto animate-pulse bg-muted rounded mb-4" />
        <div className="h-5 w-96 max-w-full mx-auto animate-pulse bg-muted rounded" />
      </header>

      <section className="px-5 md:px-16 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-16 md:gap-16">
          {/* Sidebar Skeleton */}
          <aside className="hidden md:block">
            <div className="sticky top-32 space-y-12">
              <div className="space-y-6">
                <div className="h-3 w-20 animate-pulse bg-muted rounded" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-4 w-32 animate-pulse bg-muted rounded" />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Content Skeleton */}
          <div className="space-y-12">
            <div className="flex justify-between items-center border-b border-border/30 pb-4">
              <div className="h-3 w-40 animate-pulse bg-muted rounded" />
              <div className="h-3 w-32 animate-pulse bg-muted rounded" />
            </div>
            <ProductGridSkeleton />
          </div>
        </div>
      </section>
    </main>
  )
}
