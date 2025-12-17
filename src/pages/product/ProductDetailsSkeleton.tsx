import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type ProductDetailsSkeletonProps = {
  showSidebar?: boolean;
};

const ProductDetailsSkeleton = ({
  showSidebar = true,
}: ProductDetailsSkeletonProps) => {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image + Basic info */}
          <Card>
            <CardHeader className="space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-96 w-full rounded-lg" />

              <div className="h-px w-full bg-border" />

              {/* Rating */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>

              <div className="h-px w-full bg-border" />

              {/* Price */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </CardContent>
          </Card>

          {/* Properties */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        {showSidebar ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
