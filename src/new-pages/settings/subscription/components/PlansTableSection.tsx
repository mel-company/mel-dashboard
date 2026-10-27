import { Loader2 } from "lucide-react";
import { useFetchPlans } from "@/api/wrappers/plan.wrappers";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format-currency";
import { introText, planHighlights } from "@/utils/plan-card-lines";
import { cn } from "@/lib/utils";
import { primaryButtonClass } from "./table";

type PlansTableSectionProps = {
  currentPlanId: string | null;
  onChoose: (plan: { id: string; name: string }) => void;
};

const discountNote = (percent?: number) => (percent ? ` · خصم ${percent}%` : "");

/** The plans on sale, one column each (stacked on a phone). */
const PlansTableSection = ({ currentPlanId, onChoose }: PlansTableSectionProps) => {
  const { data, isLoading } = useFetchPlans();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plans: any[] = Array.isArray(data) ? data : data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (plans.length === 0) {
    return <p className="text-sm text-slate-500">لا توجد باقات متاحة حالياً.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {plans.map((plan) => {
        const current = plan.id === currentPlanId;
        const intro = introText(plan)?.replace("للمشتركين الجدد: ", "");
        return (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-2xl border p-4",
              current
                ? "border-blue-600 bg-blue-600/5 dark:bg-blue-500/10"
                : "border-slate-200 dark:border-slate-800",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-base font-bold text-slate-900 dark:text-slate-50">
                {plan.name}
              </p>
              {current && (
                <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-medium text-white">
                  باقتك
                </span>
              )}
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
              {formatCurrency(plan.monthly_price)}
              <span className="text-sm font-normal text-slate-500"> / شهرياً</span>
            </p>
            <div className="mt-1 space-y-0.5 text-xs text-slate-500">
              <p>
                3 أشهر: {formatCurrency(plan.pricing?.quarterly?.price ?? plan.monthly_price * 3)}
                {discountNote(plan.pricing?.quarterly?.discountPercent)}
              </p>
              <p>
                سنة: {formatCurrency(plan.pricing?.yearly?.price ?? plan.yearly_price)}
                {discountNote(plan.pricing?.yearly?.discountPercent)}
              </p>
              {intro && <p className="text-blue-700 dark:text-blue-300">{intro}</p>}
            </div>

            <ul className="mt-3 flex-1 space-y-1.5 border-t border-slate-100 pt-3 text-[13px] text-slate-700 dark:border-slate-800 dark:text-slate-300">
              {planHighlights(plan).map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <Button
              className={cn(
                "mt-4 h-10 w-full",
                current
                  ? "rounded-full border border-blue-600 bg-transparent text-blue-600 hover:bg-blue-600/10"
                  : primaryButtonClass,
              )}
              onClick={() => onChoose({ id: plan.id, name: plan.name })}
            >
              {current ? "تجديد هذه الباقة" : `التبديل إلى ${plan.name}`}
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default PlansTableSection;
