import { cn } from "@/lib/utils";
import type { PlatformPaymentProvider } from "@/api/endpoints/platform-payment.endpoint";

export const PAYMENT_PROVIDERS: {
  id: PlatformPaymentProvider;
  title: string;
  detail: string;
}[] = [
  { id: "ZAIN_CASH", title: "زين كاش", detail: "ZainCash" },
  { id: "QI_CARD", title: "كي كارد", detail: "Qi Card" },
];

export function paymentProviderLabel(
  provider: PlatformPaymentProvider | null | undefined,
) {
  return (
    PAYMENT_PROVIDERS.find((option) => option.id === provider)?.title || "الدفع"
  );
}

type PaymentProviderPickerProps = {
  value: PlatformPaymentProvider | null;
  onChange: (provider: PlatformPaymentProvider) => void;
  disabled?: boolean;
};

const PaymentProviderPicker = ({
  value,
  onChange,
  disabled,
}: PaymentProviderPickerProps) => {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        طريقة الدفع
      </p>
      <div className="grid grid-cols-2 gap-3">
        {PAYMENT_PROVIDERS.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.id)}
              aria-pressed={selected}
              className={cn(
                "rounded-2xl border-2 p-3 text-right transition-all disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-sky-500 bg-sky-500/10"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
              )}
            >
              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                {option.title}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                {option.detail}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentProviderPicker;
