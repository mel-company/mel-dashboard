import { Skeleton } from "@/components/ui/skeleton";

export type ProductsSkeletonProps = {
  count?: number;
  showHeader?: boolean;
  viewMode?: "table" | "cards";
};

const ProductsSkeleton = ({
  count = 8,
  showHeader = true,
  viewMode = "table",
}: ProductsSkeletonProps) => {
  return (
    <div className="space-y-6" dir="rtl">
      {showHeader ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </>
      ) : null}

      {viewMode === "table" ? (
        <div className="overflow-hidden rounded-xl border">
          <div className="space-y-0 divide-y">
            {Array.from({ length: count }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4">
                <Skeleton className="size-11 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: count }).map((_, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-lg border bg-card shadow-sm"
            >
              <div className="p-6 pb-4">
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
              <div className="space-y-3 px-6 pb-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t px-6 py-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsSkeleton;
