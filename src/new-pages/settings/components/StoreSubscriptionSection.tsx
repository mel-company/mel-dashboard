import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useFetchStoreSubscription,
  useCancelSubscription,
  useRenewSubscription,
} from "@/api/wrappers/subscription.wrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  CheckCircle2,
  Layers,
  Loader2,
  Package,
  Rocket,
} from "lucide-react";
import SettingsCard from "./SettingsCard";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ar-IQ", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(amount) + " د.ع";

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("ar-IQ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const FEATURES_PREVIEW_COUNT = 6;

const FALLBACK_FEATURES = [
  "منتجات غير محدودة",
  "لوحة تحليلات متقدمة",
  "دعم ذو أولوية",
  "تخصيص شامل",
  "تقارير مفصلة",
  "إمكانية الوصول عبر الأجهزة",
];

const StoreSubscriptionSection = () => {
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const {
    data: subscription,
    isLoading,
    refetch,
  } = useFetchStoreSubscription();
  const cancelSubscription = useCancelSubscription();
  const renewSubscription = useRenewSubscription();

  const handleRenew = () => {
    if (!subscription?.id) {
      toast.error("لا يمكن تجديد الاشتراك — معرّف الاشتراك غير موجود");
      return;
    }

    renewSubscription.mutate(
      { id: subscription.id },
      {
        onSuccess: () => {
          toast.success("تم تجديد الاشتراك بنجاح");
          refetch();
        },
        onError: (error) => {
          const apiError = error as Error & {
            response?: { data?: { message?: string | string[] } };
          };
          const message = apiError.response?.data?.message;
          toast.error(
            Array.isArray(message)
              ? message.join(" — ")
              : message || "فشل تجديد الاشتراك",
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
  const price = plan?.monthly_price ?? plan?.yearly_price ?? 0;
  const features = plan?.features ?? [];
  const previewFeatures = features.slice(0, FEATURES_PREVIEW_COUNT);
  const remainingFeatures = Math.max(
    0,
    features.length - FEATURES_PREVIEW_COUNT,
  );
  const remainingDays = Number(subscription.remainingDays ?? 0);
  const progressPercent = Math.min(100, Math.max(8, (remainingDays / 365) * 100));
  const featureLabels =
    previewFeatures.length > 0
      ? previewFeatures.map(
          (feature: { feature?: { name?: string } }) =>
            feature.feature?.name ?? "—",
        )
      : FALLBACK_FEATURES;

  return (
    <>
      <SettingsCard title="معلومات الاشتراك">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[300px_1fr]">
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <div className="flex h-full flex-col gap-3 rounded-[18px] px-5 py-[18px]">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                  {features.length || featureLabels.length}
                </span>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  المميزات الفعّالة
                </p>
              </div>

              <ul className="space-y-[9px]">
                {featureLabels.map((label: string) => (
                  <li
                    key={label}
                    className="flex items-center justify-end gap-[7px] text-[13px] text-slate-900 dark:text-slate-100"
                  >
                    <span>{label}</span>
                    <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="size-2.5 stroke-[3]" />
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="text-left text-xs text-sky-500 hover:underline"
                onClick={() => navigate("/plans")}
              >
                + {remainingFeatures > 0 ? remainingFeatures : 6} مميزات أخرى
              </button>

              <div className="mt-auto rounded-xl bg-violet-500/5 px-4 py-3.5">
                <div className="mb-2 flex items-center justify-end gap-1.5">
                  <span className="text-[13px] font-medium text-violet-600">
                    التطوير القادمة
                  </span>
                  <Rocket className="size-4 text-violet-600" />
                </div>
                <p className="text-right text-xs leading-[1.65] text-violet-600">
                  رقّي للباقة المتقدمة: منتجات وفروع أكثر + تقارير موسّعة
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl bg-slate-50 p-6 dark:bg-slate-900">
            <div className="flex flex-1 flex-col justify-between gap-3 rounded-[18px] px-5 py-2">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-500">
                  سنوي
                </span>
                <div className="text-right">
                  <p className="text-lg font-bold text-sky-500">
                    {formatCurrency(price)}
                  </p>
                  <p className="text-xs text-slate-500">قيمة الاشتراك</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-xl px-[18px] py-2.5 text-lg font-medium text-white",
                    isActive ? "bg-emerald-500" : "bg-slate-400",
                  )}
                >
                  <span>{isActive ? "نشط" : subscription.status}</span>
                  <CheckCircle2 className="size-6" />
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
                <span>التجديد القادم</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 gap-2 rounded-[14px] border-violet-500/15 bg-violet-500/10 text-[15px] font-bold text-violet-600 hover:bg-violet-500/15 hover:text-violet-700"
                onClick={() => navigate("/plans")}
              >
                عرض جميع الباقات
                <Layers className="size-5" />
              </Button>
              <Button
                type="button"
                className="h-12 flex-1 gap-2 rounded-[14px] bg-violet-600 text-[15px] font-bold text-white hover:bg-violet-700"
                disabled={renewSubscription.isPending || !subscription.id}
                onClick={handleRenew}
              >
                {renewSubscription.isPending ? (
                  <>
                    جاري التجديد...
                    <Loader2 className="size-5 animate-spin" />
                  </>
                ) : (
                  <>
                    تجديد الاشتراك
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
