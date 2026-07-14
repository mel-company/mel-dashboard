import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useFetchStoreSubscription,
  useCancelSubscription,
  useRenewSubscription,
} from "@/api/wrappers/subscription.wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Package, Rocket } from "lucide-react";
import SettingsCard from "./SettingsCard";

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

const FEATURES_PREVIEW_COUNT = 3;

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
      <SettingsCard title="الاشتراك">
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </SettingsCard>
    );
  }

  if (!subscription) {
    return (
      <SettingsCard title="الاشتراك">
        <div className="flex flex-col items-center py-10 text-center">
          <Package className="mb-3 size-12 text-muted-foreground" />
          <p className="text-muted-foreground">لا يوجد اشتراك نشط لهذا المتجر.</p>
          <Button className="mt-4 rounded-full" onClick={() => navigate("/plans")}>
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
  const remainingFeatures = Math.max(0, features.length - FEATURES_PREVIEW_COUNT);

  return (
    <>
      <SettingsCard title="الاشتراك">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* يمين: السعر والأزرار */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 text-right">
                <p className="text-2xl font-bold text-blue-950">
                  {formatCurrency(price)}
                </p>
                <p className="text-sm text-slate-500">
                  تجديد في {formatDate(subscription.end_at)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-700"
                >
                  {subscription.remainingDays} يوم
                </Badge>
                {isActive && (
                  <Badge className="rounded-full bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-500">
                    نشط
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                className="rounded-full px-5"
                type="button"
                disabled={renewSubscription.isPending || !subscription.id}
                onClick={handleRenew}
              >
                {renewSubscription.isPending ? (
                  <>
                    <Loader2 className="ml-2 size-4 animate-spin" />
                    جاري التجديد...
                  </>
                ) : (
                  "تجديد الاشتراك"
                )}
              </Button>
              <Button
                className="rounded-full px-5"
                variant="secondary"
                type="button"
                onClick={() => navigate("/plans")}
              >
                عرض جميع الباقات
              </Button>
              <Button
                className="rounded-full px-5"
                variant="outline"
                type="button"
                disabled={!canCancel}
                onClick={() => setCancelDialogOpen(true)}
              >
                إيقاف الباقة
              </Button>
            </div>
          </div>

          {/* شمال: المميزات + التطوير القادم */}
          <div className="flex flex-col gap-4">
            {features.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex size-7 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                    {features.length}
                  </span>
                  <p className="text-sm font-bold text-blue-950">
                    المميزات الفعالة
                  </p>
                </div>

                <ul className="space-y-2.5">
                  {previewFeatures.map((feature: any, index: number) => (
                    <li
                      key={feature.feature?.id || index}
                      className="flex items-center justify-end gap-2 text-sm text-slate-700"
                    >
                      <span>{feature.feature?.name ?? "—"}</span>
                      <CheckCircle2 className="size-4 shrink-0 fill-emerald-500 text-white" />
                    </li>
                  ))}
                </ul>

                {remainingFeatures > 0 && (
                  <button
                    type="button"
                    className="mt-2 text-sm text-cyan-600 hover:underline"
                    onClick={() => navigate("/plans")}
                  >
                    + {remainingFeatures} مميزات أخرى
                  </button>
                )}
              </div>
            )}

            <div className="rounded-2xl bg-violet-50 px-4 py-3 text-right">
              <div className="mb-1 flex items-center justify-end gap-2">
                <span className="text-sm font-bold text-violet-800">
                  التطوير القادمة
                </span>
                <Rocket className="size-4 text-violet-600" />
              </div>
              <p className="text-xs leading-relaxed text-violet-700/80">
                رقي للباقة المتقدمة: منتجات وفروع أكثر + تقارير موسعة
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="text-right">
          <DialogHeader>
            <DialogTitle className="text-right">إيقاف الباقة</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من رغبتك في إيقاف اشتراكك؟ سيتم إيقاف الوصول إلى
              الخدمات في نهاية فترة الاشتراك الحالية.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-start gap-2">
            <Button
              variant="destructive"
              disabled={cancelSubscription.isPending}
              onClick={handleConfirmCancel}
            >
              {cancelSubscription.isPending ? "جاري الإيقاف..." : "تأكيد الإيقاف"}
            </Button>
            <Button variant="secondary" onClick={() => setCancelDialogOpen(false)}>
              تراجع
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoreSubscriptionSection;
