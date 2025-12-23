import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Calendar,
  Lock,
  Package,
  DollarSign,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Settings,
  Star,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorPage from "../miscellaneous/ErrorPage";
import { Badge } from "@/components/ui/badge";
import {
  useFetchStoreSubscription,
  useUpdateSubscription,
} from "@/api/wrappers/subscription.wrapper";
import { toast } from "sonner";

type Props = {};

const Payment = ({}: Props) => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading, error } = useFetchPlan(planId ?? "");

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "currency",
      currency: "IQD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(" ") : cleaned;
  };

  // Handle card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(formatCardNumber(value));
  };

  // Handle expiry date input (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setExpiryDate(value);
  };

  // Handle CVC input
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvc(value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeSubscription?.id) {
      toast.error("لا يمكن تغيير الخطة. لا يوجد اشتراك نشط.");
      return;
    }

    updateSubscription(
      {
        id: storeSubscription.id,
        data: { planId },
      },
      {
        onSuccess: () => {
          toast.success("تم تغيير الخطة بنجاح");
          navigate("/settings/subscription");
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في تغيير الخطة. حاول مرة أخرى."
          );
        },
      }
    );
  };

  const { data: storeSubscription } = useFetchStoreSubscription();
  const { mutate: updateSubscription, isPending } = useUpdateSubscription();

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
          <ArrowLeft className="size-4" />
          العودة
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-right">إتمام الدفع</h1>
          <p className="text-muted-foreground text-right mt-1">
            أكمل عملية الدفع للاشتراك في الخطة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <CreditCard className="size-5" />
                معلومات الدفع
              </CardTitle>
              <CardDescription className="text-right">
                أدخل معلومات بطاقتك الائتمانية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card Number */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-right">
                    رقم البطاقة
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                    <Input
                      id="cardNumber"
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                      className="text-right pr-10"
                    />
                  </div>
                </div>

                {/* Expiry and CVC */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="text-right">
                      تاريخ الانتهاء
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                      <Input
                        id="expiryDate"
                        type="text"
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                        className="text-right pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvc" className="text-right">
                      رمز الأمان (CVC)
                    </Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                      <Input
                        id="cvc"
                        type="text"
                        value={cvc}
                        onChange={handleCvcChange}
                        placeholder="123"
                        maxLength={3}
                        required
                        className="text-right pr-10"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full gap-2"
                  size="lg"
                  disabled={isPending || !cardNumber || !expiryDate || !cvc}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" />
                      إتمام الدفع
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Plan Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Package className="size-5" />
                تفاصيل الخطة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan Name */}
              <div>
                <h3 className="text-xl font-bold text-right mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground text-right">
                  {plan.description}
                </p>
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <DollarSign className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      السعر الشهري
                    </p>
                    <p className="text-lg font-bold">
                      {formatCurrency(plan.monthly_price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <Package className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      السعر السنوي
                    </p>
                    <p className="text-lg font-bold">
                      {formatCurrency(plan.yearly_price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modules */}
              {plan.modules && plan.modules.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-right">
                      <Settings className="size-4" />
                      <span>الوحدات ({plan.modules.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {plan.modules.slice(0, 6).map((module: any) => (
                        <Badge
                          key={module.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {module.name}
                        </Badge>
                      ))}
                      {plan.modules.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.modules.length - 6} أكثر
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-right">
                      <Star className="size-4" />
                      <span>المميزات ({plan.features.length})</span>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                      {plan.features.map((feature: any) => (
                        <div
                          key={feature.id}
                          className="flex items-start gap-2 text-sm text-right"
                        >
                          <CheckCircle2 className="size-4 text-green-600 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
