import {
  useFetchProductStats,
  type ProductStatsSummary,
} from "@/api/wrappers/product.wrappers";
import { useFetchStoreStats } from "@/api/wrappers/stats.wrappers";
import { BaseCard } from "@/components/table/top-cards";
import { cn } from "@/lib/utils";
import {
  PackageDeliveredIcon,
  PackageOpenIcon,
  PackageProcessIcon,
} from "@hugeicons-pro/core-bulk-rounded";
import { Money04Icon } from "@hugeicons-pro/core-stroke-standard";
import {
  AlertTriangle,
  Banknote,
  Package,
  ShoppingBag,
} from "lucide-react";

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

function MobileStatCard({
  title,
  value,
  icon,
  iconWrapClass,
  growth,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconWrapClass: string;
  growth?: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-3 shadow-sm dark:border-white/[0.06] dark:bg-[#0a0e27]">
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl",
          iconWrapClass,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-right">
        <p className="text-xs text-slate-400 dark:text-[#a4b1fa]">{title}</p>
        <div className="mt-0.5 flex items-center justify-end gap-2">
          {typeof growth === "number" ? (
            <span
              className={cn(
                "text-[11px] font-semibold",
                growth >= 0 ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {growth >= 0 ? "+" : ""}
              {growth}%
            </span>
          ) : null}
          <p className="truncate text-sm font-bold text-slate-900 dark:text-[#e4e7fc]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

const ProductStatsCards = () => {
  const { data, isError } = useFetchProductStats();
  const { data: storeStats } = useFetchStoreStats();

  const stats = mergeWithStoreFallback(data, storeStats?.products);

  if (isError && !storeStats) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-2.5 md:hidden">
        <MobileStatCard
          title="إجمالي أسعار المنتجات"
          value={`${stats.totalValue.toLocaleString("ar-IQ")} د.ع`}
          icon={<Banknote className="size-5" />}
          iconWrapClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
          growth={12.6}
        />
        <MobileStatCard
          title="إجمالي المنتجات"
          value={stats.totalProducts.toLocaleString("ar-IQ")}
          icon={<ShoppingBag className="size-5" />}
          iconWrapClass="bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300"
          growth={12.6}
        />
        <MobileStatCard
          title="قريبة على النفاذ"
          value={stats.lowStock.toLocaleString("ar-IQ")}
          icon={<AlertTriangle className="size-5" />}
          iconWrapClass="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
          growth={-12.6}
        />
        <MobileStatCard
          title="نفذت الكمية"
          value={stats.outOfStock.toLocaleString("ar-IQ")}
          icon={<Package className="size-5" />}
          iconWrapClass="bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
          growth={12.6}
        />
      </div>

      <div className="hidden grid-cols-2 gap-3 md:grid lg:grid-cols-4">
        <BaseCard
          icon={Money04Icon}
          title="إجمالي أسعار المنتجات"
          value={`${stats.totalValue.toLocaleString("ar-IQ")} د.ع`}
          color="success"
        />
        <BaseCard
          icon={PackageDeliveredIcon}
          title="إجمالي المنتجات"
          value={stats.totalProducts.toLocaleString("ar-IQ")}
          growth={12.6}
          color="default"
        />
        <BaseCard
          icon={PackageProcessIcon}
          title="قريبة على النفاذ"
          value={stats.lowStock.toLocaleString("ar-IQ")}
          growth={-12.6}
          color="warning"
        />
        <BaseCard
          icon={PackageOpenIcon}
          title="نفذت الكمية"
          value={stats.outOfStock.toLocaleString("ar-IQ")}
          growth={12.6}
          color="danger"
        />
      </div>
    </>
  );
};

export default ProductStatsCards;
