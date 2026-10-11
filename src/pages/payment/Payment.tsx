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
import {
  useInitStorePlatformPayment,
  useSubscriptionQuote,
} from "@/api/wrappers/platform-payment.wrapper";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/format-currency";
import {
  quoteDue,
  quoteExplanation,
  quoteNextCharge,
} from "@/utils/subscription-quote";

const Payment = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading, error } = useFetchPlan(planId ?? "");
  const initPayment = useInitStorePlatformPayment();

  /**
   * What this merchant will actually be charged, which is not
   * `plan.monthly_price`. The intro ladder is on their subscription, not on the
   * plan, so the button used to promise a number the gateway then disagreed
   * with — and for a merchant on their free month it promised a charge where
   * none was due at all.
   */
  const { data: quote, isLoading: quoteLoading } = useSubscriptionQuote(
    planId ? { type: "CHANGE_PLAN", planId, billingPeriod: "MONTHLY" } : null,
  );
  const dueNow = quoteDue(quote);
  const why = quoteExplanation(quote);
  const nextCharge = quoteNextCharge(quote);

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
          /**
           * A plan change can settle without a gateway page: when the
           * subscription has not claimed its intro month the server prices the
           * period at 0 IQD, writes the payment `PAID` and applies the new plan
           * before replying. There is no redirect because there is nothing to
           * pay, so treating a missing `redirectUrl` as a failure reported a
           * change that had already happened as one that had not.
           */
          if (data?.status === "PAID") {
            toast.success(
              Number(data?.amount) > 0
                ? "تم الدفع بنجاح وتم تحديث الباقة"
                : "تم تحديث الباقة — لا مبلغ مستحق",
            );
            navigate("/settings/store");
            return;
          }

          if (!data?.redirectUrl) {
            toast.error("لم يتم استلام رابط الدفع");
            return;
          }
          if (data?.id) {
            sessionStorage.setItem("mel_last_platform_payment_id", String(data.id));
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
          <h1 className="text-2xl font-bold">تأكيد الباقة</h1>
          <p className="text-muted-foreground">
            أكمل العملية لتفعيل الباقة الجديدة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>تأكيد الدفع</CardTitle>
              <CardDescription>
                {quote && quote.amount === 0
                  ? "لا مبلغ مستحق الآن — سيتم تفعيل الباقة مباشرة"
                  : "سيتم تحويلك إلى صفحة الدفع لإتمام العملية بأمان"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* The quote, itemised, so the number on the button is accounted
                  for before it is pressed. */}
              <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold">
                    {quoteLoading ? "..." : dueNow}
                  </span>
                  <span className="text-muted-foreground">المستحق الآن</span>
                </div>
                {why && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-left text-muted-foreground">
                      {why}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      التفصيل
                    </span>
                  </div>
                )}
                {quote && quote.savings > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(quote.savings)}
                    </span>
                    <span className="text-muted-foreground">توفير العرض</span>
                  </div>
                )}
                {nextCharge && (
                  <div className="flex items-center justify-between">
                    <span>{nextCharge}</span>
                    <span className="text-muted-foreground">
                      الدفعة القادمة
                    </span>
                  </div>
                )}
              </div>

              <Button
                className="w-full h-12 text-base"
                onClick={handlePay}
                disabled={initPayment.isPending || quoteLoading}
              >
                {initPayment.isPending ? (
                  <>
                    جاري التحضير...
                    <Loader2 className="ms-2 size-5 animate-spin" />
                  </>
                ) : quote && quote.amount === 0 ? (
                  "تفعيل الباقة"
                ) : (
                  `ادفع ${dueNow}`
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
              {/* The catalogue price, which is what the plan costs — not what
                  this merchant owes today. Those were the same number on this
                  page, and they are not the same thing. */}
              <div className="text-3xl font-bold">
                {formatCurrency(plan.monthly_price)}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / شهرياً بعد العرض
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
