import {
  Banknote,
  Box,
  PackageCheck,
  PackageMinus,
  PackageX,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useFetchProductStats,
  type ProductStatsSummary,
} from "@/api/wrappers/product.wrappers";
import { useFetchStoreStats } from "@/api/wrappers/stats.wrappers";

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-IQ")} د.ع`;
}

function TotalValueCard({ value }: { value: number }) {
  return (
    <div className="total-value-card relative col-span-2 overflow-hidden lg:col-span-1">
      <div className="pointer-events-none absolute -bottom-10 -left-6 size-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -top-8 left-1/3 size-28 rounded-full bg-[#0077b6]/30 blur-xl" />
      <div className="pointer-events-none absolute bottom-2 left-8 size-16 rounded-full border border-white/10 bg-white/5" />

      <div className="relative flex items-center justify-between gap-4 px-6 py-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 backdrop-blur-sm">
          <Banknote className="size-6 text-white" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1 space-y-2 text-right">
          <p className="page-title text-white">إجمالي أسعار المنتجات</p>
          <p className="text-[2rem] font-bold leading-none tracking-tight text-white tabular-nums lg:text-[3rem]">
            {formatPrice(value)}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatTrend(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return null;
  const sign = value >= 0 ? "↗" : "↘";
  return `${Math.abs(value).toFixed(1)}% ${sign}`;
}

type StatCardProps = {
  label: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  iconWrapClass: string;
};

function StatCard({ label, value, trend, icon, iconWrapClass }: StatCardProps) {
  const trendText = formatTrend(trend);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tracking-tight tabular-nums">
          {value}
        </p>
        {trendText ? (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {trendText}
          </p>
        ) : (
          <p className="text-xs text-transparent select-none">—</p>
        )}
      </div>
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          iconWrapClass,
        )}
      >
        {icon}
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
      <Skeleton className="col-span-2 h-[120px] rounded-[2.5rem] lg:col-span-1" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[104px] rounded-2xl" />
      ))}
    </div>
  );
}

function mergeWithStoreFallback(
  stats: ProductStatsSummary | undefined,
  storeProducts?: number,
): ProductStatsSummary {
  if (stats && stats.totalProducts > 0) return stats;
  return {
    totalValue: stats?.totalValue ?? 0,
    totalProducts: stats?.totalProducts || storeProducts || 0,
    newProducts: stats?.newProducts ?? 0,
    lowStock: stats?.lowStock ?? 0,
    outOfStock: stats?.outOfStock ?? 0,
    trends: stats?.trends,
  };
}

const ProductStatsCards = () => {
  const { data, isLoading, isError } = useFetchProductStats();
  const { data: storeStats } = useFetchStoreStats();

  if (isLoading) return <StatsSkeleton />;

  const stats = mergeWithStoreFallback(data, storeStats?.products);

  if (isError && !storeStats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
      <TotalValueCard value={stats.totalValue} />

      <StatCard
        label="إجمالي المنتجات"
        value={stats.totalProducts.toLocaleString("ar-IQ")}
        trend={stats.trends?.totalProducts}
        icon={<Box className="size-5 text-[#2563eb]" strokeWidth={1.75} />}
        iconWrapClass="bg-[#dbeafe]"
      />

      <StatCard
        label="إضافة جديدة"
        value={stats.newProducts.toLocaleString("ar-IQ")}
        trend={stats.trends?.newProducts}
        icon={
          <PackageCheck className="size-5 text-[#0d9488]" strokeWidth={1.75} />
        }
        iconWrapClass="bg-[#ccfbf1]"
      />

      <StatCard
        label="قريبة على النفاذ"
        value={stats.lowStock.toLocaleString("ar-IQ")}
        trend={stats.trends?.lowStock}
        icon={
          <PackageMinus className="size-5 text-[#ea580c]" strokeWidth={1.75} />
        }
        iconWrapClass="bg-[#ffedd5]"
      />

      <StatCard
        label="نفذت الكمية"
        value={stats.outOfStock.toLocaleString("ar-IQ")}
        trend={stats.trends?.outOfStock}
        icon={<PackageX className="size-5 text-[#dc2626]" strokeWidth={1.75} />}
        iconWrapClass="bg-[#fee2e2]"
      />
    </div>
  );
};

export default ProductStatsCards;
