import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type CategoryDetailsSkeletonProps = {
  showSidebar?: boolean;
};

const CategoryDetailsSkeleton = ({
  showSidebar = true,
}: CategoryDetailsSkeletonProps) => {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image + Basic info */}
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-7 w-20 rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-96 w-full rounded-lg" />

              <div className="h-px w-full bg-border" />

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products in category */}
          <Card>
            <CardHeader className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                  >
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Skeleton className="h-10 w-full" />
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
                  <Skeleton className="h-7 w-20 rounded-md" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-7 w-10" />
                  <Skeleton className="h-4 w-20" />
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
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CategoryDetailsSkeleton;
