import DashboardCard from "./DashboardCard";

type TopDiscount = {
  id: string;
  name: string;
  type: string;
  usageCount: number;
  maxUsage: number;
};

type TopDiscountsCardProps = {
  discounts: TopDiscount[];
};

const TopDiscountsCard = ({ discounts }: TopDiscountsCardProps) => {
  return (
    <DashboardCard
      title="أكثر الخصومات استخداماً"
      className="min-h-[226px]"
      contentClassName="space-y-4"
    >
      {discounts.slice(0, 3).map((discount) => {
        const pct =
          discount.maxUsage > 0
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
                  {discount.type}
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold text-[#00AEEF]">
                {discount.usageCount}
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
