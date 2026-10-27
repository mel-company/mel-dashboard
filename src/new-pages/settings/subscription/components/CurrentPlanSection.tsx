import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ReceiptText } from "lucide-react";
import {
  subscriptionKeys,
  useCancelSubscription,
} from "@/api/wrappers/subscription.wrapper";
import { planKeys } from "@/api/wrappers/plan.wrappers";
import { Button } from "@/components/ui/button";
import SettingsCard from "@/new-pages/settings/components/SettingsCard";
import { formatCurrency } from "@/utils/format-currency";
import { cn } from "@/lib/utils";
import { formatDay, primaryButtonClass } from "./table";
import SubscriptionDialog from "./SubscriptionDialog";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "نشط",
  PAUSED: "متوقف مؤقتاً",
  EXPIRED: "منتهي",
  CANCELLED: "ملغي",
  PENDING: "قيد الانتظار",
  TRIAL: "تجريبي",
};

const DAY_MS = 24 * 60 * 60 * 1000;

type CurrentPlanSectionProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscription: any;
  onRenew: () => void;
  onChangePlan: () => void;
  onShowPayments: () => void;
};

/** The plan this store is on, its term and last payment, and its actions. */
const CurrentPlanSection = ({
  subscription,
  onRenew,
  onChangePlan,
  onShowPayments,
}: CurrentPlanSectionProps) => {
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);
  const cancel = useCancelSubscription();

  const plan = subscription.plan;
  const status = String(subscription.status ?? "").toUpperCase();
  const remainingDays = Math.max(0, Number(subscription.remainingDays ?? 0));
  const canCancel = status === "ACTIVE" || status === "PAUSED";
  const endingSoon = status === "ACTIVE" && remainingDays <= 7;

  const termDays = Math.max(
    1,
    Math.round(
      (new Date(subscription.end_at).getTime() -
        new Date(subscription.start_at).getTime()) /
        DAY_MS,
    ),
  );
  const leftPct = Math.min(100, Math.max(0, (remainingDays / termDays) * 100));

  const active = status === "ACTIVE";

  return (
    <SettingsCard>
      <div className="rounded-2xl bg-slate-50 p-5 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] text-slate-500">باقتك الحالية</p>
            <p className="mt-1 truncate text-3xl font-extrabold">
              {plan?.name ?? "—"}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
              active
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
            )}
          >
            {STATUS_LABELS[status] ?? status}
          </span>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {formatCurrency(plan?.monthly_price ?? 0)}
          </span>{" "}
          شهرياً
        </p>
      </div>

      <div className="mt-4 px-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            {remainingDays > 0 ? "المتبقي حتى التجديد" : "انتهى الاشتراك"}
          </p>
          <p className="text-[13px] text-slate-500">
            <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {remainingDays}
            </span>{" "}
            يوم
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={cn(
              "h-full rounded-full",
              endingSoon || remainingDays === 0
                ? "bg-amber-500"
                : "bg-slate-900 dark:bg-slate-200",
            )}
            style={{ width: `${leftPct}%` }}
          />
        </div>
        <p className="mt-2 text-[13px] text-slate-500">
          {remainingDays > 0 ? "يتجدد في " : "انتهى في "}
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {formatDay(subscription.end_at)}
          </span>
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button className={cn(primaryButtonClass, "h-11")} onClick={onRenew}>
          تجديد الاشتراك
        </Button>
        <Button
          variant="secondary"
          className="h-11 rounded-full bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          onClick={onChangePlan}
        >
          تغيير الباقة
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[13px] dark:border-slate-800">
        <button
          type="button"
          className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300"
          onClick={onShowPayments}
        >
          <ReceiptText className="size-4" />
          سجل المدفوعات
        </button>
        {canCancel && (
          <button
            type="button"
            className="text-slate-400 hover:text-red-600"
            onClick={() => setCancelOpen(true)}
          >
            إلغاء الباقة
          </button>
        )}
      </div>

      <SubscriptionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="إلغاء الباقة"
        description="هل أنت متأكد من إلغاء اشتراكك؟ سيتوقف الوصول إلى الخدمات في نهاية فترة الاشتراك الحالية."
      >
        <div className="flex justify-start gap-2">
          <Button
            variant="destructive"
            className="h-11 rounded-full px-6"
            disabled={cancel.isPending}
            onClick={() =>
              cancel.mutate(undefined, {
                onSuccess: () => {
                  setCancelOpen(false);
                  void queryClient.invalidateQueries({
                    queryKey: subscriptionKeys.all,
                  });
                  void queryClient.invalidateQueries({
                    queryKey: planKeys.all,
                  });
                },
              })
            }
          >
            {cancel.isPending ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
          </Button>
          <Button
            variant="secondary"
            className="h-11 rounded-full px-6"
            onClick={() => setCancelOpen(false)}
          >
            تراجع
          </Button>
        </div>
      </SubscriptionDialog>
    </SettingsCard>
  );
};

export default CurrentPlanSection;
