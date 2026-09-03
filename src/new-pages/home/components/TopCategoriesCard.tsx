import DashboardCard from "./DashboardCard";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "../utils";

type TopCategory = {
  id: string;
  name: string;
  percent: number;
  orders?: number;
  rank?: number;
  trend?: "up" | "down" | "flat";
  image?: string | null;
};

type TopCategoriesCardProps = {
  categories: TopCategory[];
};

function CircularProgress({ percent }: { percent: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative size-12 shrink-0">
      <svg className="size-full -rotate-90" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted"
          strokeWidth="4"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={CHART_COLORS.brandPurple}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] text-text-secondary dark:text-foreground">
        {percent}%
      </span>
    </div>
  );
}

const TopCategoriesCard = ({ categories }: TopCategoriesCardProps) => {
  const imageBaseUrl = useImageBaseUrl();

  if (categories.length === 0) {
    return (
      <DashboardCard
        title="الاقسام الاعلئ طلبا"
        className="min-h-[200px] flex-1"
        contentClassName="flex items-center justify-center"
      >
        <p className="text-sm text-muted-foreground">لا توجد فئات بعد</p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="الاقسام الاعلئ طلبا"
      className="min-h-[280px] flex-1"
      contentClassName="space-y-3"
    >
      {categories.slice(0, 5).map((category, index) => {
        const rank = category.rank ?? index + 1;
        const up = category.trend !== "down";
        const trendColor = up ? "text-success" : "text-destructive";

        return (
          <div
            key={category.id}
            className="flex items-center justify-between gap-2"
          >
            <CircularProgress percent={category.percent} />
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
              <div className="min-w-0 text-right">
                <p className="truncate text-[11px] text-text-secondary dark:text-foreground">
                  {category.name}
                </p>
                <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px]">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-bold",
                      trendColor,
                    )}
                  >
                    {category.orders ?? 0}
                    <span aria-hidden className="text-[10px]">
                      {up ? "↗" : "↘"}
                    </span>
                  </span>
                  <span className="font-bold text-success/10">|</span>
                  <span className="text-[#91a0b6]">أجمالي الطلبات</span>
                </div>
              </div>
              <div className="flex size-[37px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-muted">
                <AssetImage
                  image={category.image}
                  baseUrl={imageBaseUrl}
                  alt={category.name}
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
          </div>
        );
      })}
    </DashboardCard>
  );
};

export default TopCategoriesCard;
