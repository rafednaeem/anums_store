export default function ReadyToWearLoading() {
  return (
    <div className="container mx-auto px-4 py-12 animate-pulse">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 h-12 w-64 bg-gray-200" />
        <div className="mx-auto h-5 w-96 bg-gray-200" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full space-y-6 lg:w-64">
          <div className="h-10 w-full bg-gray-200" />
          <div className="space-y-3">
            <div className="h-4 w-20 bg-gray-200" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-full bg-gray-200" />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-4 w-20 bg-gray-200" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-full bg-gray-200" />
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div className="h-5 w-24 bg-gray-200" />
            <div className="h-10 w-44 bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/5] w-full bg-gray-200" />
                <div className="h-4 w-3/4 bg-gray-200" />
                <div className="h-4 w-1/2 bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
