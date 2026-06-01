export default function RootLoading() {
  return (
    <div className="w-full animate-pulse">
      <section className="flex min-h-[560px] w-full items-center overflow-hidden bg-ethereal-mint">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl bg-gray-200/80 p-8 md:p-12">
            <div className="mb-3 h-4 w-40 bg-gray-300" />
            <div className="mb-4 h-16 w-72 bg-gray-300" />
            <div className="mb-8 h-6 w-96 bg-gray-300" />
            <div className="flex gap-3">
              <div className="h-14 w-52 bg-gray-300" />
              <div className="h-14 w-44 border-2 border-gray-300" />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 h-10 w-64 bg-gray-200" />
            <div className="h-5 w-80 bg-gray-200" />
          </div>
          <div className="h-5 w-36 bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[4/5] w-full bg-gray-200" />
              <div className="h-5 w-3/4 bg-gray-200" />
              <div className="h-4 w-1/2 bg-gray-200" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200" />
          ))}
        </div>
      </section>
    </div>
  );
}
