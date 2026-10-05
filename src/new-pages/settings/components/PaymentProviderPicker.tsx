import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useBillingProviders } from "@/api/wrappers/platform-payment.wrapper";
import type {
  BillingProvider,
  PlatformPaymentProvider,
} from "@/api/endpoints/platform-payment.endpoint";

/**
 * Arabic titles, keyed by gateway — and nothing else.
 *
 * This list used to be the source of *which* gateways exist, which made it a
 * second answer to a question the server already had: the operator's
 * «اشتراكات العملاء» switch decides whether a gateway may bill, and nothing
 * here could see it. A gateway switched off was still drawn as a button, and
 * the merchant discovered it by being refused after choosing it. The server
 * sends the list now; this is only how each one reads in Arabic.
 *
 * A gateway with no entry falls back to the brand name the server sent, so
 * adding one to the platform does not need a dashboard release to be usable.
 */
const PROVIDER_TITLES: Record<string, string> = {
  ZAIN_CASH: "زين كاش",
  QI_CARD: "كي كارد",
};

export function paymentProviderLabel(
  provider: PlatformPaymentProvider | null | undefined,
) {
  return (provider && PROVIDER_TITLES[provider]) || "الدفع";
}

type PaymentProviderPickerProps = {
  value: PlatformPaymentProvider | null;
  /**
   * Takes `null`, because the picker clears a selection it can no longer
   * honour — a gateway the operator withdrew between opening this dialog and
   * paying.
   */
  onChange: (provider: PlatformPaymentProvider | null) => void;
  disabled?: boolean;
};

const PaymentProviderPicker = ({
  value,
  onChange,
  disabled,
}: PaymentProviderPickerProps) => {
  const { data, isLoading, isError } = useBillingProviders();

  /**
   * What to draw when the list cannot be loaded, and why it is not "nothing".
   *
   * An empty picker tells a merchant holding a card that the platform accepts
   * no payment at all, and there is nothing they can do about it. A network
   * blip must not cost the sale, so a failed load falls back to the gateways
   * this build knows about and lets the server be the judge: it refuses a
   * withdrawn gateway with a readable reason, which is the behaviour this
   * whole change is replacing — but only here, in the one case where the
   * better answer is unavailable rather than merely unfetched.
   */
  const providers = useMemo<BillingProvider[] | undefined>(() => {
    if (data) return data;
    if (!isError) return undefined;
    return Object.entries(PROVIDER_TITLES).map(([provider, name], index) => ({
      provider: provider as PlatformPaymentProvider,
      name,
      logoUrl: "",
      recommended: index === 0,
    }));
  }, [data, isError]);

  /**
   * Keep the selection inside what the platform will actually accept.
   *
   * Three cases, and they are one rule: nothing chosen, or something chosen
   * that is no longer offered, becomes the server's own recommendation — the
   * gateway an omitted `provider` would have resolved to — or the first on
   * offer when the recommended one has itself been withdrawn. An empty list
   * clears the selection, which is what disables the pay button upstream
   * rather than letting a merchant submit into a refusal.
   */
  useEffect(() => {
    if (!providers) return;

    if (providers.length === 0) {
      if (value !== null) onChange(null);
      return;
    }

    if (!value || !providers.some((option) => option.provider === value)) {
      const fallback =
        providers.find((option) => option.recommended) ?? providers[0];
      onChange(fallback.provider);
    }
  }, [providers, value, onChange]);

  if (isLoading) {
    return (
      <div>
        <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          طريقة الدفع
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((key) => (
            <div
              key={key}
              className="h-[66px] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  // Reached only when the server really answered with an empty list — a
  // failed load falls back above. Said plainly rather than left as an empty
  // row: the merchant has done nothing wrong and nothing here is theirs to
  // fix, so it names who can.
  if (!providers || providers.length === 0) {
    return (
      <div>
        <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          طريقة الدفع
        </p>
        <p className="rounded-2xl border-2 border-dashed border-slate-200 p-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          لا تتوفر حالياً أي بوابة دفع للاشتراكات. تواصل معنا لإتمام العملية.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        طريقة الدفع
      </p>
      <div
        className={cn(
          "grid gap-3",
          providers.length === 1 ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        {providers.map((option) => {
          const selected = value === option.provider;
          return (
            <button
              key={option.provider}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.provider)}
              aria-pressed={selected}
              className={cn(
                "rounded-2xl border-2 p-3 text-right transition-all disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-sky-500 bg-sky-500/10"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
              )}
            >
              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                {PROVIDER_TITLES[option.provider] ?? option.name}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                {option.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentProviderPicker;
