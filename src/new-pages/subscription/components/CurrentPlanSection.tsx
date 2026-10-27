import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  subscriptionKeys,
  useCancelSubscription,
} from "@/api/wrappers/subscription.wrapper";
import { planKeys } from "@/api/wrappers/plan.wrappers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SettingsCard from "@/new-pages/settings/components/SettingsCard";
import { billingPeriodLabel } from "@/utils/subscription-quote";
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

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "نشط",
  PAUSED: "متوقف مؤقتاً",
  EXPIRED: "منتهي",
  CANCELLED: "ملغي",
  PENDING: "قيد الانتظار",
  TRIAL: "تجريبي",
};

type CurrentPlanSectionProps = {
  subscription: any;
  onRenew: () => void;
  onUpgrade?: () => void;
  upgradeName?: string | null;
};

/** The plan this store is on, its term and last payment, and the renew action. */
const CurrentPlanSection = ({
  subscription,
  onRenew,
  onUpgrade,
  upgradeName,
}: CurrentPlanSectionProps) => {
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);
  const cancel = useCancelSubscription();

  const plan = subscription.plan;
  const status = String(subscription.status ?? "").toUpperCase();
  const remainingDays = Math.max(0, Number(subscription.remainingDays ?? 0));
  const lastPayment = subscription.lastPayment ?? null;
  const canCancel = status === "ACTIVE" || status === "PAUSED";

  const rows: Array<[string, React.ReactNode]> = [
    ["الباقة", plan?.name ?? "—"],
    [
      "الحالة",
      <span
        className={cn(
          "font-medium",
          status === "ACTIVE" && remainingDays > 7 && "text-emerald-600",
          (status !== "ACTIVE" || remainingDays <= 7) && "text-amber-600",
        )}
      >
        {STATUS_LABELS[status] ?? "غير معروف"}
        {status === "ACTIVE" && remainingDays <= 7 ? " — ينتهي قريباً" : ""}
      </span>,
    ],
    ["بداية الاشتراك", formatDay(subscription.start_at)],
    [
      remainingDays > 0 ? "التجديد القادم" : "انتهى في",
      formatDay(subscription.end_at),
    ],
    ["الأيام المتبقية", `${remainingDays} يوم`],
    ["سعر الباقة", `${formatCurrency(plan?.monthly_price ?? 0)} شهرياً`],
  ];
  if (lastPayment) {
    rows.push([
      "آخر دفعة",
      `${lastPayment.amount > 0 ? formatCurrency(lastPayment.amount) : "مجاناً"} — ${
        billingPeriodLabel(lastPayment.billingPeriod) ?? ""
      } — ${formatDay(lastPayment.paidAt ?? lastPayment.createdAt)}`,
    ]);
  }

  return (
    <SettingsCard title="باقتك الحالية">
      <table className={tableClass}>
        <tbody className={bodyClass}>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td className={cn(labelCellClass, "w-40")}>{label}</td>
              <td className={cellClass}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button className={primaryButtonClass} onClick={onRenew}>
          تجديد الاشتراك
        </Button>
        {onUpgrade && (
          <Button
            variant="outline"
            className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            onClick={onUpgrade}
          >
            الترقية إلى {upgradeName ?? "نمو"}
          </Button>
        )}
        <button
          type="button"
          className="ms-auto text-xs text-slate-500 underline disabled:opacity-50"
          disabled={!canCancel}
          onClick={() => setCancelOpen(true)}
        >
          إلغاء الباقة
        </button>
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">إلغاء الباقة</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من إلغاء اشتراكك؟ سيتوقف الوصول إلى الخدمات في نهاية
              فترة الاشتراك الحالية.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-start gap-2">
            <Button
              variant="destructive"
              disabled={cancel.isPending}
              onClick={() =>
                cancel.mutate(undefined, {
                  onSuccess: () => {
                    setCancelOpen(false);
                    void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
                    void queryClient.invalidateQueries({ queryKey: planKeys.all });
                  },
                })
              }
            >
              {cancel.isPending ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
            </Button>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              تراجع
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SettingsCard>
  );
};

export default CurrentPlanSection;
