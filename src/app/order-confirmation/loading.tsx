export default function OrderConfirmationLoading() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl animate-pulse">
      <div className="text-center mb-12">
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gray-200" />
        <div className="mx-auto mb-4 h-12 w-80 bg-gray-200" />
        <div className="mx-auto h-5 w-64 bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 border-t-8 border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 w-40 bg-gray-200" />
              <div className="h-8 w-32 bg-gray-200 rounded" />
            </div>

            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-4 mb-4">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200" />
                    <div className="h-3 w-20 bg-gray-200" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-gray-200" />
              </div>
            ))}

            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-200" />
                <div className="h-4 w-24 bg-gray-200" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-200" />
                <div className="h-4 w-24 bg-gray-200" />
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-100 mt-4">
                <div className="h-6 w-16 bg-gray-200" />
                <div className="h-6 w-28 bg-gray-200" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 border-t-8 border-gray-200">
            <div className="mb-4 h-6 w-32 bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-40 bg-gray-200" />
              <div className="h-4 w-36 bg-gray-200" />
              <div className="h-4 w-24 bg-gray-200" />
              <div className="h-4 w-16 bg-gray-200" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-14 w-full bg-gray-200" />
            <div className="h-14 w-full bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
