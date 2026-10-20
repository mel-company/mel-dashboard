import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SettingsCard from "./SettingsCard";
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

/**
 * What the plan caps and how much of each this store uses, in one table. The
 * Grow-only features follow it, so a Basic merchant sees what an upgrade adds.
 */
const PlanUsageSection = () => {
  const navigate = useNavigate();
  const { data } = usePlanUsage();
  if (!data?.limits) return null;
  const limits = data.limits;
  const features = data.features;
  const anyReached = ROWS.some((row) => limits[row.key]?.reached);

  return (
    <SettingsCard title="استهلاك الباقة">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-500 dark:border-slate-800">
            <th className="py-2 text-right font-medium">العنصر</th>
            <th className="py-2 text-right font-medium">المستخدم</th>
            <th className="py-2 text-right font-medium">الحد</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {ROWS.map((row) => {
            const usage = limits[row.key];
            if (!usage) return null;
            return (
              <tr key={row.key}>
                <td className="py-2.5 font-medium text-slate-900 dark:text-slate-100">
                  {row.label}
                </td>
                <td
                  className={cn(
                    "py-2.5 tabular-nums",
                    usage.reached ? "font-bold text-amber-600" : "text-slate-700 dark:text-slate-300",
                  )}
                >
                  {usage.used.toLocaleString("en-US")}
                </td>
                <td className="py-2.5 tabular-nums text-slate-700 dark:text-slate-300">
                  {usage.limit === null ? "بلا حدود" : usage.limit.toLocaleString("en-US")}
                </td>
              </tr>
            );
          })}
          {features && (
            <>
              <tr>
                <td className="py-2.5 font-medium text-slate-900 dark:text-slate-100">
                  بكسلات الإعلانات
                </td>
                <td colSpan={2} className="py-2.5 text-slate-700 dark:text-slate-300">
                  {features.social_pixels ? "مفعّلة" : "غير متاحة في باقتك"}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-900 dark:text-slate-100">
                  النطاق الخاص
                </td>
                <td colSpan={2} className="py-2.5 text-slate-700 dark:text-slate-300">
                  {features.custom_domain ? "مفعّل" : "غير متاح في باقتك"}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
      {data.upgradeAvailable && data.upgradeTo && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-blue-500/5 px-4 py-3">
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-blue-700 dark:text-blue-300">
            {anyReached
              ? `وصلت لحد في باقتك. باقة ${data.upgradeTo.planName} بلا حدود للمنتجات والأقسام والطلبات.`
              : `باقة ${data.upgradeTo.planName}: منتجات وأقسام وطلبات بلا حدود، 3 متاجر بالذكاء الاصطناعي شهرياً، بكسلات الإعلانات ونطاق خاص.`}
          </p>
          <Button
            size="sm"
            className="rounded-full"
            onClick={() =>
              navigate(
                data.upgradeTo?.planId ? `/payment/${data.upgradeTo.planId}` : "/plans",
              )
            }
          >
            ترقية
          </Button>
        </div>
      )}
    </SettingsCard>
  );
};

export default PlanUsageSection;
