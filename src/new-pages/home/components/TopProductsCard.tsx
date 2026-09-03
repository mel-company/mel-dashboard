import DashboardCard from "./DashboardCard";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "../utils";

type TopProduct = {
  id: string;
  name: string;
  count: number;
  rank?: number;
  trend?: "up" | "down" | "flat";
  image?: string | null;
};

type TopProductsCardProps = {
  products: TopProduct[];
  maxCount?: number;
};

const TopProductsCard = ({ products }: TopProductsCardProps) => {
  const imageBaseUrl = useImageBaseUrl();

  if (products.length === 0) {
    return (
      <DashboardCard
        title="المنتجات الاكثر طلب"
        className="min-h-[200px] xl:col-span-3"
        contentClassName="flex items-center justify-center"
      >
        <p className="text-sm text-muted-foreground">لا توجد منتجات بعد</p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="المنتجات الاكثر طلب"
      className="min-h-[320px] xl:col-span-3"
      contentClassName="space-y-0 px-3.5 py-1 sm:px-4"
    >
      {products.slice(0, 5).map((product, index) => {
        const rank = product.rank ?? index + 1;
        const up = product.trend !== "down";
        const trendColor = up ? "text-success" : "text-destructive";

        return (
          <div
            key={product.id}
            className="flex h-[51px] items-center justify-end gap-2"
          >
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate text-[11px] leading-normal text-text-secondary dark:text-foreground">
                {product.name}
              </p>
              <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px]">
                <span className={cn("inline-flex items-center gap-0.5 font-bold", trendColor)}>
                  {product.count}
                  <span aria-hidden className="text-[10px]">
                    {up ? "↗" : "↘"}
                  </span>
                </span>
                <span className="font-bold text-success/10 dark:text-success/20">|</span>
                <span className="text-[#91a0b6]">أجمالي الطلبات</span>
              </div>
            </div>
            <div className="flex size-[37px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-muted">
              <AssetImage
                image={product.image}
                baseUrl={imageBaseUrl}
                alt={product.name}
                className="size-[31px] rounded-[6px] object-cover"
                fallback={
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {rank}
                  </span>
                }
              />
            </div>
            <p className="shrink-0 text-xs text-[#d0d5dd]">
              <span className="font-normal">#</span>
              <span
                className="font-bold"
                style={{ color: CHART_COLORS.brandPurple }}
              >
                {rank}
              </span>
            </p>
          </div>
        );
      })}
    </DashboardCard>
  );
};

export default TopProductsCard;
