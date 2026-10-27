import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  useInitStorePlatformPayment,
  useSubscriptionQuote,
  platformPaymentKeys,
} from "@/api/wrappers/platform-payment.wrapper";
import { subscriptionKeys } from "@/api/wrappers/subscription.wrapper";
import { planKeys } from "@/api/wrappers/plan.wrappers";
import type {
  BillingPeriod,
  PlatformPaymentProvider,
} from "@/api/endpoints/platform-payment.endpoint";
import PaymentProviderPicker from "@/new-pages/settings/components/PaymentProviderPicker";
import { LAST_PAYMENT_ID_KEY } from "@/new-pages/settings/components/DomainSettingsSection";
import { quoteDue, quoteExplanation } from "@/utils/subscription-quote";
import { formatCurrency } from "@/utils/format-currency";
import { cn } from "@/lib/utils";
import { formatDay, primaryButtonClass } from "./table";
import PeriodSwitch from "./PeriodSwitch";
import SubscriptionDialog from "./SubscriptionDialog";

type PlanCheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Renew the current plan, or switch to another one. */
  type: "RENEWAL" | "CHANGE_PLAN";
  plan: {
    id: string;
    name: string;
    /** Period picked in the plans dialog; monthly otherwise. */
    billingPeriod?: BillingPeriod;
    discounts?: Partial<Record<BillingPeriod, number>>;
  } | null;
};

/**
 * One checkout for renewing and for switching plans: pick 1, 3 or 12 months,
 * see what the server will actually charge, pick a gateway, pay.
 *
 * Renewal used to be monthly only, and a plan change went through a separate
 * page with no gateway choice.
 */
const PlanCheckoutDialog = ({
  open,
  onOpenChange,
  type,
  plan,
}: PlanCheckoutDialogProps) => {
  const queryClient = useQueryClient();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(
    plan?.billingPeriod ?? "MONTHLY",
  );
  const [provider, setProvider] = useState<PlatformPaymentProvider | null>(
    null,
  );
  const initPayment = useInitStorePlatformPayment();

  const quote = useSubscriptionQuote(
    plan ? { type, planId: plan.id, billingPeriod } : null,
    open,
  );
  const due = quoteDue(quote.data);
  const why = quoteExplanation(quote.data);
  const isFree = quote.data?.amount === 0;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    void queryClient.invalidateQueries({ queryKey: planKeys.all });
    void queryClient.invalidateQueries({ queryKey: platformPaymentKeys.all });
  };

  const handlePay = () => {
    if (!plan) return;
    initPayment.mutate(
      {
        type,
        planId: plan.id,
        billingPeriod,
        ...(provider ? { provider } : {}),
        returnBaseUrl: `${window.location.origin}/payment/return`,
      },
      {
        onSuccess: (data) => {
          // Nothing to pay (the intro month): the server already applied it.
          if (data?.status === "PAID") {
            toast.success(
              type === "CHANGE_PLAN" ? "تم تغيير الباقة" : "تم تجديد الاشتراك",
            );
            refresh();
            onOpenChange(false);
            return;
          }
          if (!data?.redirectUrl) {
            toast.error("لم يتم استلام رابط الدفع");
            return;
          }
          if (data?.id) {
            sessionStorage.setItem(LAST_PAYMENT_ID_KEY, String(data.id));
          }
          window.location.href = data.redirectUrl;
        },
        onError: (error) => {
          const message = (
            error as { response?: { data?: { message?: string | string[] } } }
          )?.response?.data?.message;
          toast.error(
            Array.isArray(message)
              ? message.join(" — ")
              : message || "فشل بدء الدفع",
          );
        },
      },
    );
  };

  const title =
    type === "CHANGE_PLAN"
      ? `التبديل إلى باقة ${plan?.name ?? ""}`
      : "تجديد الاشتراك";

  return (
    <SubscriptionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        type === "CHANGE_PLAN"
          ? "تبدأ الباقة الجديدة فوراً وتُطبَّق حدودها، والأيام المتبقية من اشتراكك الحالي تنتقل إليها."
          : "تُضاف المدة إلى نهاية اشتراكك الحالي."
      }
    >
      <div className="space-y-4">
        <PeriodSwitch
          value={billingPeriod}
          onChange={setBillingPeriod}
          discounts={plan?.discounts}
        />

        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
          <p className="text-[13px] text-slate-500">المستحق الآن</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {quote.isLoading ? "…" : quote.isError ? "—" : due}
            </span>
            {quote.data && quote.data.savings > 0 && (
              <span className="text-sm text-slate-400 line-through">
                {formatCurrency(quote.data.listAmount)}
              </span>
            )}
          </div>
          {why && (
            <p className="mt-1 text-[13px] text-blue-600 dark:text-blue-400">
              {why}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-[13px] dark:border-slate-800">
            <span className="text-slate-500">ينتهي الاشتراك في</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatDay(quote.data?.periodEndsAt)}
            </span>
          </div>
        </div>

        {!isFree && (
          <PaymentProviderPicker
            value={provider}
            onChange={setProvider}
            disabled={initPayment.isPending}
          />
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className={cn(primaryButtonClass, "h-12 flex-1 text-base")}
            disabled={!plan || initPayment.isPending || quote.isLoading}
            onClick={handlePay}
          >
            {initPayment.isPending ? (
              <>
                جاري التحضير...
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : isFree ? (
              "تأكيد"
            ) : quote.data ? (
              `ادفع ${due}`
            ) : (
              "متابعة للدفع"
            )}
          </Button>
          <Button
            variant="secondary"
            className="h-12 rounded-full px-6"
            onClick={() => onOpenChange(false)}
          >
            تراجع
          </Button>
        </div>
      </div>
    </SubscriptionDialog>
  );
};

export default PlanCheckoutDialog;
