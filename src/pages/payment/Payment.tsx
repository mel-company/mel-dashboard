import { useParams, useNavigate } from "react-router-dom";
import { useFetchPlan } from "@/api/wrappers/plan.wrappers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Loader2,
  ArrowRight,
  Star,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorPage from "../miscellaneous/ErrorPage";
import { Badge } from "@/components/ui/badge";
import { useInitStorePlatformPayment } from "@/api/wrappers/platform-payment.wrapper";
import { toast } from "sonner";

const Payment = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading, error } = useFetchPlan(planId ?? "");
  const initPayment = useInitStorePlatformPayment();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "currency",
      currency: "IQD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePay = () => {
    if (!planId) {
      toast.error("لا يمكن تغيير الخطة. لا يوجد خطة محددة.");
      return;
    }

    if (plan?.is_free) {
      toast.info("الباقة المجانية لا تحتاج دفع");
      navigate("/settings/store");
      return;
    }

    initPayment.mutate(
      {
        type: "CHANGE_PLAN",
        planId,
        billingPeriod: "MONTHLY",
        returnBaseUrl: `${window.location.origin}/payment/return`,
      },
      {
        onSuccess: (data) => {
          if (!data?.redirectUrl) {
            toast.error("لم يتم استلام رابط الدفع من زين كاش");
            return;
          }
          window.location.href = data.redirectUrl;
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message ||
              "فشل بدء الدفع عبر زين كاش. حاول مرة أخرى.",
          );
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">الخطة غير موجودة</h2>
        <p className="text-muted-foreground mb-4">
          الخطة التي تحاول الدفع لها غير موجودة.
        </p>
        <Button onClick={() => navigate("/plans")} variant="outline">
          العودة إلى الخطط
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate("/plans")}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowRight className="size-4" />
          العودة
        </Button>
        <div>
          <h1 className="text-2xl font-bold">الدفع عبر زين كاش</h1>
          <p className="text-muted-foreground">
            أكمل الدفع لتفعيل الباقة الجديدة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>تأكيد الدفع</CardTitle>
              <CardDescription>
                سيتم تحويلك إلى صفحة زين كاش لإتمام العملية بأمان
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full h-12 text-base"
                onClick={handlePay}
                disabled={initPayment.isPending}
              >
                {initPayment.isPending ? (
                  <>
                    جاري التحضير...
                    <Loader2 className="ms-2 size-5 animate-spin" />
                  </>
                ) : (
                  `ادفع ${formatCurrency(plan.monthly_price)} عبر زين كاش`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.most_popular && (
                  <Badge className="gap-1">
                    <Star className="size-3" />
                    الأكثر شيوعاً
                  </Badge>
                )}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                {formatCurrency(plan.monthly_price)}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / شهرياً
                </span>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                بعد إتمام الدفع يتم تحديث باقة المتجر تلقائياً.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
