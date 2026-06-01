export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-12 animate-pulse">
      <div className="flex flex-col gap-12 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="aspect-[4/5] w-full bg-gray-200" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-16 bg-gray-200" />
            ))}
          </div>
        </div>

        <div className="w-full space-y-6 lg:w-[440px]">
          <div className="h-8 w-3/4 bg-gray-200" />
          <div className="h-6 w-1/3 bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200" />
            <div className="h-4 w-5/6 bg-gray-200" />
            <div className="h-4 w-2/3 bg-gray-200" />
          </div>

          <div className="space-y-3">
            <div className="h-4 w-16 bg-gray-200" />
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-12 border-2 border-gray-200 bg-gray-100" />
              ))}
            </div>
          </div>

          <div className="h-14 w-full bg-gray-200" />
          <div className="h-14 w-full bg-gray-200" />

          <div className="space-y-2 border-t border-gray-100 pt-6">
            <div className="h-4 w-32 bg-gray-200" />
            <div className="h-4 w-48 bg-gray-200" />
            <div className="h-4 w-40 bg-gray-200" />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="mb-8 h-8 w-48 bg-gray-200" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/5] w-full bg-gray-200" />
              <div className="h-4 w-3/4 bg-gray-200" />
              <div className="h-4 w-1/2 bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
