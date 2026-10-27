import SettingsCard from "@/new-pages/settings/components/SettingsCard";
import { usePlanUsage } from "@/hooks/use-plan-limits";
import type { LimitedResource } from "@/api/endpoints/plan.endpoints";
import { cn } from "@/lib/utils";

const ROWS: Array<{ key: LimitedResource; label: string }> = [
  { key: "products", label: "المنتجات" },
  { key: "categories", label: "الأقسام" },
  { key: "categoryGroups", label: "مجموعات الأقسام" },
  { key: "coupons", label: "الكوبونات" },
  { key: "monthlyOrders", label: "طلبات هذا الشهر" },
];

/** The plan's caps this store has, with a bar each. Nothing on an unlimited plan. */
const UsageSection = () => {
  const { data } = usePlanUsage();
  const limits = data?.limits;
  const rows = limits
    ? ROWS.filter((row) => limits[row.key] && limits[row.key].limit !== null)
    : [];
  if (!limits || rows.length === 0) return null;

  return (
    <SettingsCard title="حدود الباقة">
      <div className="space-y-3">
        {rows.map((row) => {
          const usage = limits[row.key];
          const limit = usage.limit as number;
          const pct = limit > 0 ? Math.min(100, (usage.used / limit) * 100) : 0;
          return (
            <div key={row.key}>
              <div className="mb-1.5 flex items-center justify-between text-[13px]">
                <span className="text-slate-900 dark:text-slate-100">
                  {row.label}
                </span>
                <span
                  className={cn(
                    "tabular-nums",
                    usage.reached
                      ? "font-bold text-amber-600"
                      : "text-slate-500",
                  )}
                >
                  {usage.used.toLocaleString("en-US")} من{" "}
                  {limit.toLocaleString("en-US")}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={cn(
                    "h-full rounded-full",
                    usage.reached
                      ? "bg-amber-500"
                      : "bg-slate-900 dark:bg-slate-200",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SettingsCard>
  );
};

export default UsageSection;
