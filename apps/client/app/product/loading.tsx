const Loading = () => {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      {/* Header Skeleton */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse mb-4"></div>
        <div className="h-4 w-96 bg-zinc-800 rounded animate-pulse"></div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden animate-pulse"
            >
              {/* Product Image Skeleton */}
              <div className="aspect-square bg-zinc-800 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-shimmer"></div>
              </div>

              {/* Product Info Skeleton */}
              <div className="p-4 space-y-3">
                {/* Product Name */}
                <div className="h-5 bg-zinc-800 rounded animate-pulse"></div>

                {/* Product Description */}
                <div className="space-y-2">
                  <div className="h-3 bg-zinc-800 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2"></div>
                </div>

                {/* Price */}
                <div className="h-6 bg-zinc-800 rounded animate-pulse w-24"></div>

                {/* Button */}
                <div className="h-10 bg-zinc-800 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Spinner Overlay */}
      <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          {/* Animated Logo/Spinner */}
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-zinc-700 border-t-white rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-zinc-500 rounded-full animate-spin animation-delay-150"></div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">
              Loading Products
            </h3>
            <p className="text-zinc-400 text-sm">
              Fetching the latest collection...
            </p>
          </div>

          {/* Loading Dots Animation */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
