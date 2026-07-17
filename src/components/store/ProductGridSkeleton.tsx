export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="relative aspect-[3/4] bg-muted mb-6" />
          <div className="h-3 w-20 bg-muted rounded mb-2" />
          <div className="h-5 w-3/4 bg-muted rounded mb-3" />
          <div className="h-4 w-1/3 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}
