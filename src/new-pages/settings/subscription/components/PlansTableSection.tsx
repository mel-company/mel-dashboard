import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useFetchPlans } from "@/api/wrappers/plan.wrappers";
import type { BillingPeriod } from "@/api/endpoints/platform-payment.endpoint";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format-currency";
import { introText, planHighlights } from "@/utils/plan-card-lines";
import { cn } from "@/lib/utils";
import { primaryButtonClass } from "./table";
import { periodDiscount, periodPrice } from "./plan-pricing";
import PeriodSwitch from "./PeriodSwitch";

export type ChosenPlan = {
  id: string;
  name: string;
  billingPeriod: BillingPeriod;
  discounts: Partial<Record<BillingPeriod, number>>;
};

type PlansTableSectionProps = {
  currentPlanId: string | null;
  onChoose: (plan: ChosenPlan) => void;
};

const PER_PERIOD: Record<BillingPeriod, string> = {
  MONTHLY: "شهرياً",
  QUARTERLY: "لـ 3 أشهر",
  YEARLY: "سنوياً",
};

const MONTHS: Record<BillingPeriod, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  YEARLY: 12,
};

/** The plans on sale side by side (stacked on a phone), priced for one period. */
const PlansTableSection = ({
  currentPlanId,
  onChoose,
}: PlansTableSectionProps) => {
  const { data, isLoading } = useFetchPlans();
  const [period, setPeriod] = useState<BillingPeriod>("MONTHLY");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plans: any[] = Array.isArray(data) ? data : (data?.data ?? []);

  if (isLoading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (plans.length === 0) {
    return (
      <p className="text-sm text-slate-500">لا توجد باقات متاحة حالياً.</p>
    );
  }

  // The switch shows the best saving any plan offers for that period.
  const discounts = {
    QUARTERLY: Math.max(...plans.map((p) => periodDiscount(p, "QUARTERLY"))),
    YEARLY: Math.max(...plans.map((p) => periodDiscount(p, "YEARLY"))),
  };

  return (
    <div className="space-y-4">
      <PeriodSwitch value={period} onChange={setPeriod} discounts={discounts} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {plans.map((plan) => {
          const current = plan.id === currentPlanId;
          const price = periodPrice(plan, period);
          const months = MONTHS[period];
          const listPrice = Number(plan.monthly_price ?? 0) * months;
          const intro =
            period === "MONTHLY"
              ? introText(plan)?.replace("للمشتركين الجدد: ", "")
              : null;
          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border p-5",
                current
                  ? "border-slate-900 ring-1 ring-slate-900 dark:border-slate-200 dark:ring-slate-200"
                  : "border-slate-200 dark:border-slate-800",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {plan.name}
                </p>
                {current && (
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900">
                    باقتك الحالية
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {formatCurrency(price)}
                </span>
                <span className="text-sm text-slate-500">
                  {PER_PERIOD[period]}
                </span>
              </div>
              <p className="mt-1 min-h-5 text-xs text-slate-500">
                {months > 1 && price < listPrice ? (
                  <>
                    <span className="line-through">
                      {formatCurrency(listPrice)}
                    </span>
                    {" · "}
                    {formatCurrency(Math.round(price / months))} للشهر
                  </>
                ) : intro ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {intro}
                  </span>
                ) : null}
              </p>

              <ul className="mt-4 flex-1 space-y-2 border-t border-slate-100 pt-4 text-[13px] text-slate-700 dark:border-slate-800 dark:text-slate-300">
                {planHighlights(plan).map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "mt-5 h-11 w-full",
                  current
                    ? "rounded-full bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                    : primaryButtonClass,
                )}
                onClick={() =>
                  onChoose({
                    id: plan.id,
                    name: plan.name,
                    billingPeriod: period,
                    discounts: {
                      QUARTERLY: periodDiscount(plan, "QUARTERLY"),
                      YEARLY: periodDiscount(plan, "YEARLY"),
                    },
                  })
                }
              >
                {current ? "تجديد هذه الباقة" : `التبديل إلى ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlansTableSection;
