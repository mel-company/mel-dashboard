import { Skeleton } from "@/components/ui/skeleton";

export type ProductsSkeletonProps = {
  count?: number;
  showHeader?: boolean;
};

const ProductsSkeleton = ({
  count = 8,
  showHeader = true,
}: ProductsSkeletonProps) => {
  return (
    <div className="space-y-6" dir="rtl">
      {showHeader ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full sm:w-36" />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-lg border bg-card overflow-hidden shadow-sm"
          >
            <div className="p-6 pb-4">
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
            <div className="px-6 space-y-3 pb-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-10" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-14" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t px-6 py-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsSkeleton;
