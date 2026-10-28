import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkBadge02Icon,
  CheckmarkCircle02Icon,
  Rocket01Icon,
  Tick02Icon,
} from "@hugeicons-pro/core-duotone-rounded";
import SettingsCard from "@/new-pages/settings/components/SettingsCard";
import {
  subscriptionKeys,
  useCancelSubscription,
  useFetchStoreSubscription,
} from "@/api/wrappers/subscription.wrapper";
import { planKeys, useFetchPlans } from "@/api/wrappers/plan.wrappers";
import type { BillingPeriod } from "@/api/endpoints/platform-payment.endpoint";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format-currency";
import { billingPeriodLabel } from "@/utils/subscription-quote";
import { planHighlights } from "@/utils/plan-card-lines";
import { cn } from "@/lib/utils";
import PlansTableSection, {
  type ChosenPlan,
} from "./components/PlansTableSection";
import { periodDiscount, periodPrice } from "./components/plan-pricing";
import PaymentHistorySection from "./components/PaymentHistorySection";
import PlanCheckoutDialog from "./components/PlanCheckoutDialog";
import SubscriptionDialog from "./components/SubscriptionDialog";
import { formatDay } from "./components/table";

type Checkout = {
  type: "RENEWAL" | "CHANGE_PLAN";
  plan: Omit<ChosenPlan, "billingPeriod"> &
    Partial<Pick<ChosenPlan, "billingPeriod">>;
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "نشط",
  PAUSED: "متوقف مؤقتاً",
  EXPIRED: "منتهي",
  CANCELLED: "ملغي",
  PENDING: "قيد الانتظار",
  TRIAL: "تجريبي",
};

const DAY_MS = 24 * 60 * 60 * 1000;
/** Feature lines shown before «+ N مميزات أخرى». */
const FEATURES_SHOWN = 6;

const panelClass = "rounded-2xl bg-slate-50 p-5 dark:bg-slate-900";

/**
 * Store settings → «معلومات الاشتراك», as in the Figma settings frame: the
 * term (price, period, days left, renewal date, renew / all plans) beside the
 * plan's features and its next upgrade. Plans, checkout, payment history and
 * cancelling open in dialogs.
 */
const SubscriptionInfoSection = () => {
  const queryClient = useQueryClient();
  const { data: subscription, isLoading } = useFetchStoreSubscription();
  const { data: plansData } = useFetchPlans();
  const cancel = useCancelSubscription();
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [plansOpen, setPlansOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  if (isLoading) {
    return (
      <SettingsCard title="معلومات الاشتراك">
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </SettingsCard>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plans: any[] = Array.isArray(plansData)
    ? plansData
    : (plansData?.data ?? []);
  const plan = subscription?.plan;
  // The catalogue copy carries `card_lines` and `pricing`; a retired plan is
  // not on sale, so fall back to the subscription's own row.
  const catalogPlan = plans.find((p) => p.id === plan?.id) ?? plan;

  const currentPlan = plan
    ? {
        id: plan.id as string,
        name: plan.name as string,
        discounts: {
          QUARTERLY: periodDiscount(catalogPlan, "QUARTERLY"),
          YEARLY: periodDiscount(catalogPlan, "YEARLY"),
        },
      }
    : null;

  const dialogs = (
    <>
      <SubscriptionDialog
        open={plansOpen}
        onOpenChange={setPlansOpen}
        title="الباقات"
        description="اختر باقة للتجديد أو التبديل."
        className="sm:max-w-3xl"
      >
        <PlansTableSection
          currentPlanId={currentPlan?.id ?? null}
          onChoose={(chosen) => {
            setPlansOpen(false);
            setCheckout({
              type: chosen.id === currentPlan?.id ? "RENEWAL" : "CHANGE_PLAN",
              plan: chosen,
            });
          }}
        />
      </SubscriptionDialog>

      <SubscriptionDialog
        open={paymentsOpen}
        onOpenChange={setPaymentsOpen}
        title="سجل المدفوعات"
        className="sm:max-w-3xl"
      >
        <PaymentHistorySection />
      </SubscriptionDialog>

      <SubscriptionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="إلغاء الباقة"
        description="هل أنت متأكد من إلغاء اشتراكك؟ سيتوقف الوصول إلى الخدمات في نهاية فترة الاشتراك الحالية."
      >
        <div className="flex justify-start gap-2">
          <Button
            variant="destructive-outline"
            className="h-11 px-6"
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
            variant="brand-soft"
            className="h-11 px-6"
            onClick={() => setCancelOpen(false)}
          >
            تراجع
          </Button>
        </div>
      </SubscriptionDialog>

      {/* Keyed so each checkout starts on the period picked for it. */}
      <PlanCheckoutDialog
        key={
          checkout
            ? `${checkout.type}-${checkout.plan.id}-${checkout.plan.billingPeriod ?? ""}`
            : "closed"
        }
        open={!!checkout}
        onOpenChange={(open) => !open && setCheckout(null)}
        type={checkout?.type ?? "RENEWAL"}
        plan={checkout?.plan ?? null}
      />
    </>
  );

  if (!subscription || !plan) {
    return (
      <SettingsCard title="معلومات الاشتراك">
        <div
          className={cn(
            panelClass,
            "flex flex-wrap items-center justify-between gap-3",
          )}
        >
          <p className="text-sm text-slate-500">لا يوجد اشتراك لهذا المتجر.</p>
          <Button
            variant="brand"
            className="h-11 px-6"
            onClick={() => setPlansOpen(true)}
          >
            عرض جميع الباقات
          </Button>
        </div>
        {dialogs}
      </SettingsCard>
    );
  }

  const status = String(subscription.status ?? "").toUpperCase();
  const active = status === "ACTIVE";
  const remainingDays = Math.max(0, Number(subscription.remainingDays ?? 0));
  const canCancel = status === "ACTIVE" || status === "PAUSED";
  const endingSoon = remainingDays <= 7;
  const termDays = Math.max(
    1,
    Math.round(
      (new Date(subscription.end_at).getTime() -
        new Date(subscription.start_at).getTime()) /
        DAY_MS,
    ),
  );
  const leftPct = Math.min(100, Math.max(0, (remainingDays / termDays) * 100));

  const period = (subscription.lastPayment?.billingPeriod ??
    "MONTHLY") as BillingPeriod;
  const price = periodPrice(catalogPlan, period);

  const features = planHighlights(catalogPlan);
  const shown = showAllFeatures ? features : features.slice(0, FEATURES_SHOWN);
  const hidden = features.length - FEATURES_SHOWN;
  const upgradeTo = subscription.upgradeAvailable
    ? subscription.upgradeTo
    : null;

  return (
    <SettingsCard title="معلومات الاشتراك">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_300px]">
        {/* The term */}
        <div className={cn(panelClass, "flex flex-col")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                {formatCurrency(price)}
              </p>
              <p className="text-xs text-slate-500">قيمة الاشتراك</p>
            </div>
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-[#b282ff]">
              {billingPeriodLabel(period) ?? "شهري"}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-slate-500">
              <span className="text-4xl font-bold text-slate-900 dark:text-slate-50">
                {remainingDays}
              </span>{" "}
              <span className="text-sm">يوم</span>
            </p>
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold",
                active
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
              )}
            >
              {active && (
                <HugeiconsIcon icon={CheckmarkBadge02Icon} size={20} />
              )}
              {STATUS_LABELS[status] ?? status}
            </span>
          </div>

          <div className="mt-3 h-[7px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className={cn(
                "h-full rounded-full",
                endingSoon
                  ? "bg-amber-500"
                  : "bg-linear-to-l from-[#b282ff] to-[#33c5ff]",
              )}
              style={{ width: `${leftPct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[13px]">
            <span className="text-slate-500">
              {remainingDays > 0 ? "التجديد القادم" : "انتهى في"}
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {formatDay(subscription.end_at)}
            </span>
          </div>

          <div className="mt-auto grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2">
            <Button
              variant="brand"
              className="h-12"
              onClick={() =>
                currentPlan &&
                setCheckout({ type: "RENEWAL", plan: currentPlan })
              }
            >
              <HugeiconsIcon icon={Tick02Icon} size={18} />
              تجديد الاشتراك
            </Button>
            <Button
              variant="brand-soft"
              className="h-12"
              onClick={() => setPlansOpen(true)}
            >
              <HugeiconsIcon icon={Tick02Icon} size={18} />
              عرض جميع الباقات
            </Button>
          </div>
          <p className="mt-3 text-center text-xs leading-5 text-slate-500">
            <button
              type="button"
              className="underline hover:text-slate-700 dark:hover:text-slate-300"
              onClick={() => setPaymentsOpen(true)}
            >
              سجل المدفوعات
            </button>
            {" · "}
            يمكنك مراسلة الدعم اذا كنت تواجه اي مشاكل في الاشتراك
            {canCancel && (
              <>
                {" او تريد "}
                <button
                  type="button"
                  className="underline hover:text-red-600"
                  onClick={() => setCancelOpen(true)}
                >
                  الغاء الباقة
                </button>
              </>
            )}
          </p>
        </div>

        {/* What the plan includes */}
        <div className={panelClass}>
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-slate-900 dark:text-slate-50">
              المميزات الفعّالة
            </p>
            <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-medium text-emerald-600">
              {features.length}
            </span>
          </div>
          <ul className="mt-3 space-y-2 text-[13px] text-slate-700 dark:text-slate-300">
            {shown.map((line) => (
              <li key={line} className="flex gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {hidden > 0 && (
            <button
              type="button"
              className="mt-3 text-xs font-medium text-sky-500 hover:text-sky-600"
              onClick={() => setShowAllFeatures((v) => !v)}
            >
              {showAllFeatures ? "عرض أقل" : `+ ${hidden} مميزات أخرى`}
            </button>
          )}

          {upgradeTo && (
            <button
              type="button"
              onClick={() => setPlansOpen(true)}
              className="mt-4 block w-full rounded-xl border-t border-slate-200 bg-white p-4 text-right hover:bg-violet-500/5 dark:border-slate-800 dark:bg-slate-950"
            >
              <span className="flex items-center gap-1.5 text-[13px] font-bold text-violet-700 dark:text-[#b282ff]">
                <HugeiconsIcon icon={Rocket01Icon} size={16} />
                الترقية القادمة
              </span>
              <span className="mt-1.5 block text-xs leading-5 text-slate-500">
                رقّي لباقة {upgradeTo.planName} للحصول على مزايا أكثر
              </span>
            </button>
          )}
        </div>
      </div>
      {dialogs}
    </SettingsCard>
  );
};

export default SubscriptionInfoSection;
