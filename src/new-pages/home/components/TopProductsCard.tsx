import DashboardCard from "./DashboardCard";

type TopProduct = {
  id: string;
  name: string;
  count: number;
  image?: string;
};

type TopProductsCardProps = {
  products: TopProduct[];
  maxCount: number;
};

const TopProductsCard = ({ products, maxCount }: TopProductsCardProps) => {
  return (
    <DashboardCard
      title="أكثر المنتجات طلباً"
      className="min-h-[320px] lg:col-span-3"
      contentClassName="space-y-4"
    >
      {products.slice(0, 5).map((product, index) => {
        const pct = maxCount > 0 ? (product.count / maxCount) * 100 : 0;
        return (
          <div key={product.id} className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-xs font-bold text-slate-500 dark:bg-white/6 dark:text-white/50">
              {product.image ? (
                <img
                  src={product.image}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                index + 1
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-white/90">
                {product.name}
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[#00AEEF] to-[#9139C4]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-white/50">
              {product.count}
            </span>
          </div>
        );
      })}
    </DashboardCard>
  );
};

export default TopProductsCard;
