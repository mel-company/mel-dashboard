import type { BillingPeriod } from "@/api/endpoints/platform-payment.endpoint";
import { BILLING_PERIODS } from "@/utils/subscription-quote";
import { HugeiconsIcon } from "@hugeicons/react";
import { DiscountTag01Icon } from "@hugeicons-pro/core-stroke-standard";
import { cn } from "@/lib/utils";

type PeriodSwitchProps = {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
  /** Percent off per period, shown as a badge beside its label when above zero. */
  discounts?: Partial<Record<BillingPeriod, number>>;
};

/** 1, 3 or 12 months as one segmented control, with the saving on each. */
const PeriodSwitch = ({ value, onChange, discounts }: PeriodSwitchProps) => (
  <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-900">
    {BILLING_PERIODS.map((period) => {
      const selected = value === period.value;
      const off = discounts?.[period.value] ?? 0;
      return (
        <button
          key={period.value}
          type="button"
          onClick={() => onChange(period.value)}
          className={cn(
            "flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2 py-2 text-sm font-medium transition-colors",
            selected
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-50"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
          )}
        >
          {period.label}
          {off > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <HugeiconsIcon icon={DiscountTag01Icon} size={12} />
              <span className="hidden sm:inline">وفّر</span>
              {off}%
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export default PeriodSwitch;
