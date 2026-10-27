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
import { formatDay, primaryButtonClass } from "./table";

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
  subscription: any;
  onRenew: () => void;
  onUpgrade?: () => void;
  upgradeName?: string | null;
};

/** A label and its value in the settings page's grey pill row. */
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex h-12 items-center justify-between gap-3 rounded-[14px] bg-slate-100 px-4 dark:bg-slate-900">
    <span className="text-[13px] text-slate-500 dark:text-slate-400">{label}</span>
    <span className="truncate text-[13px] font-medium text-slate-900 dark:text-slate-100">
      {children}
    </span>
  </div>
);

/** The plan this store is on, its term and last payment, and its actions. */
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

  return (
    <SettingsCard title="معلومات الاشتراك">
      <div className="mb-4 rounded-[14px] bg-slate-100 px-4 py-3.5 dark:bg-slate-900">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            {remainingDays > 0 ? "المتبقي حتى التجديد" : "انتهى الاشتراك"}
          </p>
          <p>
            <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {remainingDays}
            </span>{" "}
            <span className="text-[13px] text-slate-500">يوم</span>
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className={cn(
              "h-full rounded-full",
              endingSoon || remainingDays === 0 ? "bg-amber-500" : "bg-blue-600",
            )}
            style={{ width: `${leftPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Row label="الباقة">{plan?.name ?? "—"}</Row>
        <Row label="الحالة">
          <span
            className={cn(
              status === "ACTIVE" && !endingSoon ? "text-emerald-600" : "text-amber-600",
            )}
          >
            {STATUS_LABELS[status] ?? "غير معروف"}
            {endingSoon ? " — ينتهي قريباً" : ""}
          </span>
        </Row>
        <Row label="سعر الباقة">{formatCurrency(plan?.monthly_price ?? 0)} شهرياً</Row>
        <Row label="بداية الاشتراك">{formatDay(subscription.start_at)}</Row>
        <Row label={remainingDays > 0 ? "التجديد القادم" : "انتهى في"}>
          {formatDay(subscription.end_at)}
        </Row>
        <Row label="آخر دفعة">
          {lastPayment
            ? `${lastPayment.amount > 0 ? formatCurrency(lastPayment.amount) : "مجاناً"} · ${
                billingPeriodLabel(lastPayment.billingPeriod) ?? ""
              }`
            : "—"}
        </Row>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button className={cn(primaryButtonClass, "h-11 px-6")} onClick={onRenew}>
          تجديد الاشتراك
        </Button>
        {onUpgrade && (
          <Button
            variant="outline"
            className="h-11 rounded-full border-blue-600 px-6 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950"
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
