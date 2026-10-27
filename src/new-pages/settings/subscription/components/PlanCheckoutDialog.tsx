import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  BILLING_PERIODS,
  quoteDue,
  quoteExplanation,
} from "@/utils/subscription-quote";
import { formatCurrency } from "@/utils/format-currency";
import { cn } from "@/lib/utils";
import {
  bodyClass,
  cellClass,
  formatDay,
  labelCellClass,
  primaryButtonClass,
  tableClass,
} from "./table";

type PlanCheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Renew the current plan, or switch to another one. */
  type: "RENEWAL" | "CHANGE_PLAN";
  plan: { id: string; name: string } | null;
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
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("MONTHLY");
  const [provider, setProvider] = useState<PlatformPaymentProvider | null>(null);
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
    type === "CHANGE_PLAN" ? `التبديل إلى باقة ${plan?.name ?? ""}` : "تجديد الاشتراك";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">{title}</DialogTitle>
          <DialogDescription className="text-right">
            {type === "CHANGE_PLAN"
              ? "تبدأ الباقة الجديدة فوراً وتُطبَّق حدودها، والأيام المتبقية من اشتراكك الحالي تنتقل إليها."
              : "تُضاف المدة إلى نهاية اشتراكك الحالي."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {BILLING_PERIODS.map((period) => (
            <button
              key={period.value}
              type="button"
              onClick={() => setBillingPeriod(period.value)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                billingPeriod === period.value
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900",
              )}
            >
              {period.label}
            </button>
          ))}
        </div>

        <table className={tableClass}>
          <tbody className={bodyClass}>
            <tr>
              <td className={labelCellClass}>المستحق الآن</td>
              <td className={cn(cellClass, "font-bold text-slate-900 dark:text-slate-50")}>
                {quote.isLoading ? "…" : quote.isError ? "—" : due}
              </td>
            </tr>
            {quote.data && quote.data.savings > 0 && (
              <tr>
                <td className={labelCellClass}>بدون خصم</td>
                <td className={cn(cellClass, "line-through")}>
                  {formatCurrency(quote.data.listAmount)}
                </td>
              </tr>
            )}
            {why && (
              <tr>
                <td className={labelCellClass}>التفاصيل</td>
                <td className={cellClass}>{why}</td>
              </tr>
            )}
            <tr>
              <td className={labelCellClass}>ينتهي الاشتراك في</td>
              <td className={cellClass}>{formatDay(quote.data?.periodEndsAt)}</td>
            </tr>
          </tbody>
        </table>

        {!isFree && (
          <PaymentProviderPicker
            value={provider}
            onChange={setProvider}
            disabled={initPayment.isPending}
          />
        )}

        <div className="flex justify-start gap-2">
          <Button
            className={primaryButtonClass}
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
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            تراجع
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanCheckoutDialog;
