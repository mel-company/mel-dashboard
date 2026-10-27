import type { BillingPeriod } from "@/api/endpoints/platform-payment.endpoint";
import { BILLING_PERIODS } from "@/utils/subscription-quote";
import { cn } from "@/lib/utils";

type PeriodSwitchProps = {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
  /** Percent off per period, shown under its label when above zero. */
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
            "flex flex-col items-center justify-center rounded-xl px-2 py-2 text-sm font-medium transition-colors",
            selected
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-50"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
          )}
        >
          {period.label}
          <span
            className={cn(
              "text-[11px] font-normal",
              off > 0 ? "text-blue-600 dark:text-blue-400" : "invisible",
            )}
          >
            وفّر {off}%
          </span>
        </button>
      );
    })}
  </div>
);

export default PeriodSwitch;
