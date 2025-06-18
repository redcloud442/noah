"use client";

import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-40 w-3/4" />
        <Skeleton className="h-40 w-1/2" />
        <Skeleton className="h-40 w-1/2" />
      </div>
    </div>
  );
};

export default LoadingSkeleton;
