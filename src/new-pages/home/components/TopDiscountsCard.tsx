import DashboardCard from "./DashboardCard";
import { formatCount } from "@/utils/format-currency";

type TopDiscount = {
  id: string;
  name: string;
  /** Figma prints the discount's value and kind here (e.g. «30%» / «نسبة مئوية»); the code is the fallback. */
  type: string;
  value?: string | null;
  valueType?: string | null;
  usageCount: number;
  /** Either a 0–1 fraction or a 0–100 percentage — both are accepted. */
  progress?: number;
  maxUsage?: number;
};

type TopDiscountsCardProps = {
  discounts: TopDiscount[];
};

const TopDiscountsCard = ({ discounts }: TopDiscountsCardProps) => {
  if (discounts.length === 0) {
    return (
      <DashboardCard
        title="الخصومات والكوبونات في الاعلى استخداما"
        className="min-h-[226px]"
        contentClassName="flex items-center justify-center"
      >
        <p className="text-sm text-muted-foreground">لا توجد كوبونات</p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="الخصومات والكوبونات في الاعلى استخداما"
      className="min-h-[226px]"
      contentClassName="space-y-4"
    >
      {discounts.slice(0, 3).map((discount) => {
        // The API is inconsistent about the unit, so accept both.
        const pct =
          discount.progress != null
            ? discount.progress > 1
              ? discount.progress
              : discount.progress * 100
            : discount.maxUsage && discount.maxUsage > 0
              ? (discount.usageCount / discount.maxUsage) * 100
              : 0;
        return (
          <div key={discount.id} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-white/90">
                  {discount.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-white/40">
                  {discount.value ?? discount.type}
                  {discount.valueType ? (
                    <span className="ms-1.5 opacity-80">{discount.valueType}</span>
                  ) : null}
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold text-[#00AEEF]">
                {formatCount(discount.usageCount)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-l from-[#00AEEF] to-[#9139C4]"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </DashboardCard>
  );
};

export default TopDiscountsCard;
