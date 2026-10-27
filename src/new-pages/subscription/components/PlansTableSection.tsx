import { Loader2 } from "lucide-react";
import { useFetchPlans } from "@/api/wrappers/plan.wrappers";
import { Button } from "@/components/ui/button";
import SettingsCard from "@/new-pages/settings/components/SettingsCard";
import { formatCurrency } from "@/utils/format-currency";
import { introText, planHighlights } from "@/utils/plan-card-lines";
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

type PlansTableSectionProps = {
  currentPlanId: string | null;
  onChoose: (plan: { id: string; name: string }) => void;
};

const discountNote = (percent?: number) => (percent ? ` (خصم ${percent}%)` : "");

/** The plans on sale side by side, with a switch button under each. */
const PlansTableSection = ({ currentPlanId, onChoose }: PlansTableSectionProps) => {
  const { data, isLoading } = useFetchPlans();
  const plans: any[] = Array.isArray(data) ? data : data?.data ?? [];

  if (isLoading) {
    return (
      <SettingsCard title="الباقات">
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </SettingsCard>
    );
  }
  if (plans.length === 0) return null;

  const anyIntro = plans.some((plan) => introText(plan));

  return (
    <SettingsCard title="الباقات">
      <div className="overflow-x-auto">
        <table className={cn(tableClass, "min-w-[480px]")}>
          <thead>
            <tr className={headRowClass}>
              <th className={cn(thClass, "w-32")} />
              {plans.map((plan) => (
                <th key={plan.id} className={cn(thClass, "pe-4 align-bottom")}>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-50">
                    {plan.name}
                  </span>
                  {plan.id === currentPlanId && (
                    <span className="ms-2 rounded-full bg-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                      باقتك
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={bodyClass}>
            <tr>
              <td className={labelCellClass}>شهرياً</td>
              {plans.map((plan) => (
                <td key={plan.id} className={cn(cellClass, "font-bold")}>
                  {formatCurrency(plan.monthly_price)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={labelCellClass}>3 أشهر</td>
              {plans.map((plan) => (
                <td key={plan.id} className={cellClass}>
                  {formatCurrency(plan.pricing?.quarterly?.price ?? plan.monthly_price * 3)}
                  {discountNote(plan.pricing?.quarterly?.discountPercent)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={labelCellClass}>سنة</td>
              {plans.map((plan) => (
                <td key={plan.id} className={cellClass}>
                  {formatCurrency(plan.pricing?.yearly?.price ?? plan.yearly_price)}
                  {discountNote(plan.pricing?.yearly?.discountPercent)}
                </td>
              ))}
            </tr>
            {anyIntro && (
              <tr>
                <td className={labelCellClass}>عرض البداية</td>
                {plans.map((plan) => (
                  <td key={plan.id} className={cellClass}>
                    {introText(plan)?.replace("للمشتركين الجدد: ", "") ?? "—"}
                  </td>
                ))}
              </tr>
            )}
            <tr>
              <td className={cn(labelCellClass, "align-top")}>تشمل</td>
              {plans.map((plan) => (
                <td key={plan.id} className={cn(cellClass, "align-top")}>
                  <ul className="space-y-1">
                    {planHighlights(plan).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <td />
              {plans.map((plan) => (
                <td key={plan.id} className="py-3 pe-4">
                  {plan.id === currentPlanId ? (
                    <span className="text-xs text-slate-500">باقتك الحالية</span>
                  ) : (
                    <Button
                      size="sm"
                      className={primaryButtonClass}
                      onClick={() => onChoose({ id: plan.id, name: plan.name })}
                    >
                      التبديل إلى {plan.name}
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </SettingsCard>
  );
};

export default PlansTableSection;
