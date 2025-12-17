import { Skeleton } from "@/components/ui/skeleton";

export type DiscountsSkeletonProps = {
  count?: number;
  showHeader?: boolean;
};

const DiscountsSkeleton = ({
  count = 6,
  showHeader = true,
}: DiscountsSkeletonProps) => {
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-lg border bg-card overflow-hidden shadow-sm"
          >
            <div className="p-6 pb-4">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div className="px-6 space-y-3 pb-4">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="flex items-center justify-end border-t px-6 py-3">
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscountsSkeleton;
