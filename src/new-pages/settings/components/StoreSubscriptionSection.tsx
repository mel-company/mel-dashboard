import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useFetchStoreSubscription,
  useCancelSubscription,
  useRenewSubscription,
} from "@/api/wrappers/subscription.wrapper";
import {
  useInitStorePlatformPayment,
  useSubscriptionQuote,
} from "@/api/wrappers/platform-payment.wrapper";
import {
  billingPeriodLabel,
  quoteDue,
  quoteExplanation,
} from "@/utils/subscription-quote";
import { planKeys } from "@/api/wrappers/plan.wrappers";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Layers,
  Loader2,
  Package,
  Rocket,
} from "lucide-react";
import SettingsCard from "./SettingsCard";
import { AR_LATN_LOCALE } from "@/utils/format-currency";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString(AR_LATN_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const FEATURES_PREVIEW_COUNT = 6;

type Entitlements = {
  max_users?: number;
  ai_store_credits?: number;
  ai_editor_credits?: number;
  ai_tamima_credits?: number;
  has_mobile_app?: boolean;
  has_ai_editor?: boolean;
  has_tamima?: boolean;
  has_pos?: boolean;
};

type LastPayment = {
  amount: number;
  billingPeriod: "MONTHLY" | "QUARTERLY" | "YEARLY";
  durationMonths: number;
  paidAt: string | null;
  createdAt: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * What this store can use right now, from the server's `entitlements` (the
 * plan's grant while the term is in force, the free floor once it is not).
 *
 * The list used to fall back to six invented lines — «دعم ذو أولوية»,
 * «تقارير مفصلة» — whenever the plan had no feature rows, which is every plan
 * in production, so every merchant read the same made-up list.
 */
const entitlementLabels = (e: Entitlements | undefined): string[] => {
  if (!e) return [];
  const labels: string[] = [];
  if (e.has_ai_editor) labels.push("محرر المتجر بالذكاء الاصطناعي");
  if (e.has_tamima) labels.push("مساعد تميمة");
  if (e.ai_store_credits)
    labels.push(`${e.ai_store_credits} توليد متجر بالذكاء الاصطناعي`);
  if (e.ai_editor_credits)
    labels.push(`${e.ai_editor_credits} رصيد للمحرر الذكي`);
  if (e.ai_tamima_credits)
    labels.push(`${e.ai_tamima_credits} رصيد لمساعد تميمة`);
  if (e.has_pos) labels.push("نقطة البيع (POS)");
  if (e.has_mobile_app) labels.push("تطبيق التاجر");
  if (e.max_users)
    labels.push(
      e.max_users === 1 ? "مستخدم واحد" : `حتى ${e.max_users} مستخدمين`,
    );
  return labels;
};

/** The chip printed the raw enum for every state except ACTIVE. */
const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "نشط",
  PAUSED: "متوقف مؤقتاً",
  EXPIRED: "منتهي",
  CANCELLED: "ملغي",
  PENDING: "قيد الانتظار",
  TRIAL: "تجريبي",
};

const subscriptionStatusLabel = (status?: string | null) =>
  (status && SUBSCRIPTION_STATUS_LABELS[status.toUpperCase()]) || "غير معروف";

const StoreSubscriptionSection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const {
    data: subscription,
    isLoading,
    refetch,
  } = useFetchStoreSubscription();
  const cancelSubscription = useCancelSubscription();
  const initPayment = useInitStorePlatformPayment();
  const renewFree = useRenewSubscription();

  /**
   * What a one-month renewal costs this merchant. `plan.monthly_price` is the
   * catalogue price, and the intro ladder lives on the subscription — so this
   * button named a gateway and no price, which at least had the virtue of not
   * being wrong. Now it states the amount, and when the amount is zero it stops
   * promising a payment page there is no need for.
   */
  const renewQuote = useSubscriptionQuote(
    subscription?.planId || subscription?.plan?.id
      ? {
          type: "RENEWAL",
          planId: (subscription.planId || subscription.plan.id) as string,
          billingPeriod: "MONTHLY",
        }
      : null,
  );
  const renewDue = quoteDue(renewQuote.data);
  const renewWhy = quoteExplanation(renewQuote.data);
  const renewIsFree = renewQuote.data?.amount === 0;
  const renewBusy = initPayment.isPending || renewFree.isPending;

  const afterRenewSuccess = (message: string) => {
    toast.success(message);
    void refetch();
    void queryClient.invalidateQueries({ queryKey: planKeys.entitlements() });
  };

  const handleRenew = () => {
    const planId = subscription?.planId || subscription?.plan?.id;
    if (!planId) {
      toast.error("لا يمكن تجديد الاشتراك — معرّف الباقة غير موجود");
      return;
    }

    // Catalogue free plans never go through a gateway — extend the term.
    if (subscription?.plan?.is_free) {
      if (!subscription.id) {
        toast.error("لا يمكن تجديد الاشتراك — معرّف الاشتراك غير موجود");
        return;
      }
      renewFree.mutate(
        { id: subscription.id, durationMonths: 1 },
        {
          onSuccess: () => afterRenewSuccess("تم تجديد الاشتراك"),
          onError: (error) => {
            const message = (
              error as { response?: { data?: { message?: string } } }
            )?.response?.data?.message;
            toast.error(message || "فشل تجديد الاشتراك");
          },
        },
      );
      return;
    }

    initPayment.mutate(
      {
        type: "RENEWAL",
        planId,
        billingPeriod: "MONTHLY",
        returnBaseUrl: `${window.location.origin}/payment/return`,
      },
      {
        onSuccess: (data) => {
          /**
           * Settled with nothing to pay — the intro month prices the period at
           * 0 IQD, so the server writes the payment `PAID` and extends the term
           * before replying, with no gateway page to send anyone to. This used
           * to report the one renewal path that always succeeds as a failure.
           */
          if (data?.status === "PAID") {
            afterRenewSuccess(
              Number(data?.amount) > 0
                ? "تم الدفع بنجاح وتم تجديد الاشتراك"
                : "تم تجديد الاشتراك — لا مبلغ مستحق",
            );
            return;
          }

          if (!data?.redirectUrl) {
            toast.error("لم يتم استلام رابط الدفع");
            return;
          }
          if (data?.id) {
            sessionStorage.setItem(
              "mel_last_platform_payment_id",
              String(data.id),
            );
          }
          window.location.href = data.redirectUrl;
        },
        onError: (error) => {
          const apiError = error as Error & {
            response?: { data?: { message?: string | string[] } };
          };
          const message = apiError.response?.data?.message;
          toast.error(
            Array.isArray(message)
              ? message.join(" — ")
              : message || "فشل بدء الدفع",
          );
        },
      },
    );
  };

  const handleConfirmCancel = () => {
    cancelSubscription.mutate(undefined, {
      onSuccess: () => {
        setCancelDialogOpen(false);
        refetch();
      },
    });
  };

  if (isLoading) {
    return (
      <SettingsCard title="معلومات الاشتراك">
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </SettingsCard>
    );
  }

  if (!subscription) {
    return (
      <SettingsCard title="معلومات الاشتراك">
        <div className="flex flex-col items-center py-10 text-center">
          <Package className="mb-3 size-12 text-muted-foreground" />
          <p className="text-muted-foreground">لا يوجد اشتراك نشط لهذا المتجر.</p>
          <Button
            className="mt-4 rounded-full"
            onClick={() => navigate("/plans")}
          >
            عرض جميع الباقات
          </Button>
        </div>
      </SettingsCard>
    );
  }

  const plan = subscription.plan;
  const isActive = subscription.status === "ACTIVE";
  const canCancel =
    subscription.status === "ACTIVE" || subscription.status === "PAUSED";
  const lastPayment: LastPayment | null = subscription.lastPayment ?? null;
  const allFeatures = Array.from(
    new Set([
      ...entitlementLabels(subscription.entitlements),
      ...(plan?.features ?? [])
        .map((f: { feature?: { name?: string } }) => f.feature?.name?.trim())
        .filter(Boolean),
    ]),
  ) as string[];
  const featureLabels = allFeatures.slice(0, FEATURES_PREVIEW_COUNT);
  const remainingFeatures = allFeatures.length - featureLabels.length;

  // The badge said «سنوي» for everyone, and the bar measured against a year
  // with an 8% floor. Both now come from the payment that bought this term.
  const periodLabel = lastPayment
    ? billingPeriodLabel(lastPayment.billingPeriod)
    : null;
  const remainingDays = Math.max(0, Number(subscription.remainingDays ?? 0));
  const termDays = lastPayment
    ? Math.max(1, lastPayment.durationMonths) *
      (lastPayment.billingPeriod === "YEARLY" &&
      lastPayment.durationMonths === 1
        ? 365
        : 30)
    : Math.max(
        1,
        Math.round(
          (new Date(subscription.end_at).getTime() -
            new Date(subscription.start_at).getTime()) /
            DAY_MS,
        ),
      );
  const progressPercent = Math.min(
    100,
    Math.max(0, (remainingDays / Math.max(termDays, remainingDays)) * 100),
  );

  /**
   * «قيمة الاشتراك» printed the catalogue price, so a merchant on the free
   * intro month read 39,000. Show what they actually paid for this term, and
   * the list price only when there is no payment to show.
   */
  const shownAmount = lastPayment
    ? lastPayment.amount > 0
      ? formatCurrency(lastPayment.amount)
      : "مجاناً"
    : formatCurrency(plan?.monthly_price ?? 0);
  const amountLabel = lastPayment
    ? `آخر دفعة — ${formatDate(lastPayment.paidAt ?? lastPayment.createdAt)}`
    : "سعر الباقة الشهري";

  const upgradeTo = subscription.upgradeAvailable
    ? (subscription.upgradeTo as { planName?: string } | null)
    : null;

  return (
    <>
      <SettingsCard title="معلومات الاشتراك">
        {/* RTL: the first child sits rightmost — Figma leads with the
            feature list and puts the plan summary on the left. */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[300px_1fr]">
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <div className="flex h-full flex-col gap-3 rounded-[18px] px-5 py-[18px]">
              <div className="flex items-center justify-between">

                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  المميزات الفعّالة
                </p>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                  {allFeatures.length}
                </span>
              </div>

              <ul className="space-y-[9px]">
                {featureLabels.map((label: string, index: number) => (
                  <li
                    key={`${label}-${index}`}
                    className="flex items-center justify-end gap-[7px] text-[13px] text-slate-900 dark:text-slate-100"
                  >
                    <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="size-2.5 stroke-3" />
                    </span>
                    <span className="w-full">{label}</span>
                  </li>
                ))}
              </ul>

              {allFeatures.length === 0 && (
                <p className="text-[13px] text-slate-500">
                  لا توجد مميزات مفعّلة حالياً.
                </p>
              )}

              {remainingFeatures > 0 && (
                <button
                  type="button"
                  className="text-start text-xs text-sky-500 hover:underline"
                  onClick={() => navigate("/plans")}
                >
                  + {remainingFeatures} مميزات أخرى
                </button>
              )}

              {/* What Grow adds over Basic; on Grow, what is still to come. */}
              <div className="mt-auto rounded-xl bg-violet-500/5 px-4 py-3.5">
                <div className="mb-2 flex items-center justify-start gap-1.5">
                  <Rocket className="size-4 text-violet-600" />
                  <span className="text-[13px] font-medium text-violet-600">
                    {upgradeTo ? "ترقية متاحة" : "قريباً"}
                  </span>
                </div>
                <p className="text-start text-xs leading-[1.65] text-violet-600">
                  {upgradeTo
                    ? `رقّي إلى باقة ${upgradeTo.planName ?? "نمو"} لمنتجات وأقسام وطلبات بلا حدود، ومساعد المحرر الذكي، وبكسلات الإعلانات، ونطاقك الخاص.`
                    : "الباقة الاحترافية: تصميم من Figma ودفع إلكتروني."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2.5 rounded-2xl bg-slate-50 p-6 dark:bg-slate-900">
            <div className="flex flex-1 flex-col justify-between gap-3 rounded-[18px] px-5 py-2">
              <div className="flex items-center justify-between">
                {periodLabel ? (
                  <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-500">
                    {periodLabel}
                  </span>
                ) : (
                  <span />
                )}
                <div className="text-right">
                  <p className="text-lg font-bold text-sky-500">
                    {shownAmount}
                  </p>
                  <p className="text-xs text-slate-500">{amountLabel}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-xl px-[18px] py-2.5 text-lg font-medium text-white",
                    isActive ? "bg-emerald-500" : "bg-slate-400",
                  )}
                >
                  <span>{subscriptionStatusLabel(subscription.status)}</span>
                  {isActive ? (
                    <CheckCircle2 className="size-6" />
                  ) : (
                    <AlertCircle className="size-6" />
                  )}
                </div>
                <p className="text-right">
                  <span className="text-[38px] font-medium text-sky-400">
                    {remainingDays}
                  </span>{" "}
                  <span className="text-[15px] text-indigo-300">يوم</span>
                </p>
              </div>

              <div className="h-[7px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-linear-to-l from-sky-500 to-violet-600"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[13px] text-slate-500">
                <span>{formatDate(subscription.end_at)}</span>
                <span>
                  {remainingDays <= 0
                    ? "انتهى في"
                    : isActive
                      ? "التجديد القادم"
                      : "ينتهي في"}
                </span>
              </div>

              {renewWhy && (
                <div className="flex items-start justify-between gap-4 text-[13px] text-slate-500">
                  <span className="text-left">{renewWhy}</span>
                  <span className="shrink-0">عرض الاشتراك</span>
                </div>
              )}
            </div>

            {/* Wraps: the renew label carries the amount now, and a nowrap
                pair pushed the whole panel out of the card. */}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 min-w-[170px] flex-1 gap-2 rounded-[14px] border-violet-500/15 bg-violet-500/10 text-[15px] font-bold text-violet-600 hover:bg-violet-500/15 hover:text-violet-700"
                onClick={() => navigate("/plans")}
              >
                عرض جميع الباقات
                <Layers className="size-5" />
              </Button>
              <Button
                type="button"
                className="h-12 min-w-[170px] flex-1 gap-2 rounded-[14px] bg-violet-600 text-[15px] font-bold text-white hover:bg-violet-700"
                disabled={renewBusy || !subscription?.plan?.id}
                onClick={handleRenew}
              >
                {renewBusy ? (
                  <>
                    جاري التحضير...
                    <Loader2 className="size-5 animate-spin" />
                  </>
                ) : (
                  <>
                    {renewIsFree || subscription?.plan?.is_free
                      ? "تجديد مجاناً"
                      : renewQuote.isLoading
                        ? "تجديد"
                        : renewQuote.isError
                          ? "تجديد الاشتراك"
                          : `تجديد — ${renewDue}`}
                    <CheckCircle2 className="size-5" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-[13px] text-slate-500">
              يمكنك مراسلة الدعم اذا كنت تواجه اي مشاكل في الاشتراك او تريد{" "}
              <button
                type="button"
                className="underline disabled:opacity-50"
                disabled={!canCancel}
                onClick={() => setCancelDialogOpen(true)}
              >
                الغاء الباقة
              </button>
            </p>
          </div>
        </div>
      </SettingsCard>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="text-right">
          <DialogHeader>
            <DialogTitle className="text-right">الغاء الباقة</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من رغبتك في الغاء اشتراكك؟ سيتم إيقاف الوصول إلى
              الخدمات في نهاية فترة الاشتراك الحالية.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-start gap-2">
            <Button
              variant="destructive"
              disabled={cancelSubscription.isPending}
              onClick={handleConfirmCancel}
            >
              {cancelSubscription.isPending ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCancelDialogOpen(false)}
            >
              تراجع
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoreSubscriptionSection;
