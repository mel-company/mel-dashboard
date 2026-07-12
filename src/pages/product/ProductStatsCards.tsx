
import {
  useFetchProductStats,
  type ProductStatsSummary,
} from "@/api/wrappers/product.wrappers";
import { useFetchStoreStats } from "@/api/wrappers/stats.wrappers";
import { BaseCard, FeaturedCard } from "@/components/table/top-cards";
import { BoxIcon, Money04Icon, PackageDeliveredIcon, PackageOpenIcon, PackageProcessIcon } from "@hugeicons-pro/core-bulk-rounded";
import { Money04Icon as Money04IconStroked } from "@hugeicons-pro/core-stroke-rounded";



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
  const { data, isError } = useFetchProductStats();
  const { data: storeStats } = useFetchStoreStats();


  // if (isLoading) return <StatsSkeleton />;

  const stats = mergeWithStoreFallback(data, storeStats?.products);

  const baseCards = [{
    icon: BoxIcon,
    title: "إجمالي المنتجات",
    value: stats.totalProducts.toLocaleString("ar-IQ"),
    growth: 12.6,
    color: "default",
  },
  {
    icon: PackageDeliveredIcon,
    title: "أضافة جديدة",
    value: stats.totalProducts.toLocaleString("ar-IQ"),
    growth: 12.6,
    color: "success",
  },
  {
    icon: PackageProcessIcon,
    title: "قريبة على النفاذ",
    value: stats.totalProducts.toLocaleString("ar-IQ"),
    growth: 12.6,
    color: "warning",
  },
  {
    icon: PackageOpenIcon,
    title: "نفذت الكمية",
    value: stats.totalProducts.toLocaleString("ar-IQ"),
    growth: 12.6,
    color: "danger",
  }]


  if (isError && !storeStats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {/* <TotalValueCard value={stats.totalValue} /> */}

      <FeaturedCard
        title="إجمالي المنتجات"
        value={stats.totalProducts.toLocaleString("ar-IQ")}
        // trend={stats.trends?.totalProducts}
        icon={Money04Icon}
        strokedIcon={Money04IconStroked}

        color="primary"
      />
      {baseCards?.map((card, index) => <BaseCard
        key={index}
        icon={card.icon}
        title={card.title}
        value={card.value}
        growth={card.growth}
        color={card.color as any}
      />)}
    </div>
  );
};

export default ProductStatsCards;
