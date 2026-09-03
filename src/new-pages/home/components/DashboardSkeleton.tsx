import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => {
  return (
    <div
      className="space-y-3 rounded-[28px] bg-surface p-3 sm:p-4 lg:p-4"
      dir="rtl"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
        <Skeleton className="min-h-[320px] rounded-[18px] md:col-span-2 xl:col-span-6" />
        <div className="flex flex-col gap-3 xl:col-span-3">
          <Skeleton className="min-h-[140px] rounded-[18px]" />
          <Skeleton className="min-h-[200px] flex-1 rounded-[18px]" />
        </div>
        <Skeleton className="min-h-[240px] rounded-[18px] xl:col-span-3" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
        <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-5">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_1fr]">
            <Skeleton className="min-h-[280px] rounded-[18px]" />
            <Skeleton className="min-h-[280px] rounded-[18px]" />
          </div>
          <Skeleton className="min-h-[259px] rounded-[18px]" />
        </div>
        <div className="flex flex-col gap-3 xl:col-span-3">
          <Skeleton className="min-h-[215px] rounded-[18px]" />
          <Skeleton className="min-h-[200px] flex-1 rounded-[18px]" />
        </div>
        <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-4">
          <Skeleton className="min-h-[164px] rounded-[18px]" />
          <Skeleton className="min-h-[176px] rounded-[18px]" />
          <Skeleton className="min-h-[226px] rounded-[18px]" />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
