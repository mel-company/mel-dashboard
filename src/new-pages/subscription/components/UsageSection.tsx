import { Button } from "@/components/ui/button";
import SettingsCard from "@/new-pages/settings/components/SettingsCard";
import { usePlanUsage } from "@/hooks/use-plan-limits";
import type {
  LimitedResource,
  PlanFeatureKey,
} from "@/api/endpoints/plan.endpoints";
import { cn } from "@/lib/utils";
import {
  bodyClass,
  cellClass,
  headRowClass,
  labelCellClass,
  primaryButtonClass,
  tableClass,
  thClass,
} from "./table";

const ROWS: Array<{ key: LimitedResource; label: string }> = [
  { key: "products", label: "المنتجات" },
  { key: "categories", label: "الأقسام" },
  { key: "categoryGroups", label: "مجموعات الأقسام" },
  { key: "coupons", label: "الكوبونات" },
  { key: "monthlyOrders", label: "طلبات هذا الشهر" },
];

/** Grow-only switches; the three that default on read `!== false`. */
const FEATURES: Array<{ key: PlanFeatureKey; label: string; defaultOn?: boolean }> = [
  { key: "online_payment", label: "الدفع الإلكتروني", defaultOn: true },
  { key: "courier_integrations", label: "ربط شركات الشحن", defaultOn: true },
  { key: "advanced_stats", label: "الإحصائيات المتقدمة", defaultOn: true },
  { key: "social_pixels", label: "بكسلات الإعلانات" },
  { key: "custom_domain", label: "النطاق الخاص" },
];

/**
 * What the plan caps and how much of each this store uses, with a bar per
 * row, then which plan features are on.
 */
const UsageSection = ({ onUpgrade }: { onUpgrade?: () => void }) => {
  const { data } = usePlanUsage();
  if (!data?.limits) return null;
  const limits = data.limits;
  const features = data.features;
  const anyReached = ROWS.some((row) => limits[row.key]?.reached);

  return (
    <SettingsCard>
      <table className={tableClass}>
        <thead>
          <tr className={headRowClass}>
            <th className={thClass}>العنصر</th>
            <th className={cn(thClass, "w-1/2")}>الاستهلاك</th>
            <th className={thClass}>المستخدم</th>
          </tr>
        </thead>
        <tbody className={bodyClass}>
          {ROWS.map((row) => {
            const usage = limits[row.key];
            if (!usage) return null;
            const pct =
              usage.limit === null || usage.limit === 0
                ? 0
                : Math.min(100, (usage.used / usage.limit) * 100);
            return (
              <tr key={row.key}>
                <td className={labelCellClass}>{row.label}</td>
                <td className="py-2.5 pe-4">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        usage.reached ? "bg-amber-500" : "bg-blue-600",
                      )}
                      style={{ width: usage.limit === null ? "100%" : `${pct}%` }}
                    />
                  </div>
                </td>
                <td
                  className={cn(
                    cellClass,
                    usage.reached && "font-bold text-amber-600",
                  )}
                >
                  {usage.limit === null
                    ? `${usage.used.toLocaleString("en-US")} — بلا حدود`
                    : `${usage.used.toLocaleString("en-US")} من ${usage.limit.toLocaleString("en-US")}`}
                </td>
              </tr>
            );
          })}
          {features &&
            FEATURES.map((feature) => {
              const on = feature.defaultOn
                ? features[feature.key] !== false
                : !!features[feature.key];
              return (
                <tr key={feature.key}>
                  <td className={labelCellClass}>{feature.label}</td>
                  <td colSpan={2} className="py-2.5 pe-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        on
                          ? "bg-blue-600/10 text-blue-700 dark:text-blue-300"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                      )}
                    >
                      {on ? "مفعّل" : "غير متاح في باقتك"}
                    </span>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      {onUpgrade && data.upgradeTo && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-blue-600/5 px-4 py-3">
          <p className="min-w-0 flex-1 text-sm text-blue-800 dark:text-blue-200">
            {anyReached
              ? `وصلت لحد في باقتك. باقة ${data.upgradeTo.planName} بلا حدود للمنتجات والأقسام والطلبات.`
              : `باقة ${data.upgradeTo.planName}: منتجات وأقسام وطلبات بلا حدود.`}
          </p>
          <Button size="sm" className={primaryButtonClass} onClick={onUpgrade}>
            الترقية إلى {data.upgradeTo.planName}
          </Button>
        </div>
      )}
    </SettingsCard>
  );
};

export default UsageSection;
