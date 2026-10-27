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
import { billingPeriodLabel } from "@/utils/subscription-quote";
import { formatCurrency } from "@/utils/format-currency";
import { cn } from "@/lib/utils";
import { formatDay } from "./table";

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

/** One fact under the hero: a small label over its value. */
const Fact = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="min-w-0">
    <p className="text-xs text-white/70">{label}</p>
    <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
  </div>
);

/**
 * The plan at a glance: name, status, days left against the term, the next
 * renewal and last payment, and the two actions a merchant comes here for.
 */
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
    <section className="relative overflow-hidden rounded-[22px] bg-blue-600 p-5 text-white shadow-sm sm:p-6 dark:bg-blue-700">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-sky-300/30 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-white/75">باقتك الحالية</p>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                status === "ACTIVE" && !endingSoon
                  ? "bg-white/20 text-white"
                  : "bg-amber-300 text-amber-950",
              )}
            >
              {STATUS_LABELS[status] ?? "غير معروف"}
              {endingSoon ? " — ينتهي قريباً" : ""}
            </span>
          </div>
          <h2 className="mt-1 text-3xl font-extrabold sm:text-4xl">
            {plan?.name ?? "—"}
          </h2>
          <p className="mt-1 text-sm text-white/80">
            {formatCurrency(plan?.monthly_price ?? 0)} شهرياً
          </p>
        </div>

        <div className="w-full max-w-sm">
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-bold leading-none tabular-nums">
              {remainingDays}
            </span>
            <span className="text-sm text-white/80">يوم متبقٍ</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${leftPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-white/75">
            {remainingDays > 0 ? "التجديد القادم" : "انتهى في"}{" "}
            {formatDay(subscription.end_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
          <Button
            className="h-11 rounded-full bg-white px-6 font-bold text-blue-700 hover:bg-white/90"
            onClick={onRenew}
          >
            تجديد الاشتراك
          </Button>
          {onUpgrade && (
            <Button
              variant="outline"
              className="h-11 rounded-full border-white/50 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
              onClick={onUpgrade}
            >
              الترقية إلى {upgradeName ?? "نمو"}
            </Button>
          )}
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-4 sm:grid-cols-4">
        <Fact label="بداية الاشتراك" value={formatDay(subscription.start_at)} />
        <Fact label="نهاية الاشتراك" value={formatDay(subscription.end_at)} />
        <Fact
          label="آخر دفعة"
          value={
            lastPayment
              ? `${lastPayment.amount > 0 ? formatCurrency(lastPayment.amount) : "مجاناً"} · ${
                  billingPeriodLabel(lastPayment.billingPeriod) ?? ""
                }`
              : "—"
          }
        />
        <div className="flex items-end justify-between gap-2">
          <Fact
            label="تاريخ آخر دفعة"
            value={
              lastPayment
                ? formatDay(lastPayment.paidAt ?? lastPayment.createdAt)
                : "—"
            }
          />
          <button
            type="button"
            className="shrink-0 text-xs text-white/70 underline hover:text-white disabled:opacity-50"
            disabled={!canCancel}
            onClick={() => setCancelOpen(true)}
          >
            إلغاء الباقة
          </button>
        </div>
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
    </section>
  );
};

export default CurrentPlanSection;
