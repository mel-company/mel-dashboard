import { useFetchStoreSubscription } from "@/api/wrappers/subscription.wrapper";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  RefreshCw,
  Trash2,
  CreditCard,
  Settings,
  Pencil,
} from "lucide-react";
import ErrorPage from "../miscellaneous/ErrorPage";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

type Props = {};

const SubscriptionSettings = ({}: Props) => {
  const navigate = useNavigate();

  const {
    data: subscription,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchStoreSubscription();

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "currency",
      currency: "IQD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: string | undefined) => {
    if (!status) {
      return {
        className: "bg-gray-600 text-white",
        text: "غير معروف",
      };
    }

    const statusUpper = status.toUpperCase();
    const statusMap: Record<string, { className: string; text: string }> = {
      ACTIVE: {
        className: "bg-green-600 text-white",
        text: "نشط",
      },
      PAUSED: {
        className: "bg-yellow-600 text-white",
        text: "متوقف",
      },
      CANCELLED: {
        className: "bg-red-600 text-white",
        text: "ملغي",
      },
      EXPIRED: {
        className: "bg-gray-600 text-white",
        text: "منتهي",
      },
    };
    return (
      statusMap[statusUpper] || {
        className: "bg-gray-600 text-white",
        text: status,
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">لا توجد اشتراك</h2>
        <p className="text-muted-foreground">لا يوجد اشتراك نشط لهذا المتجر.</p>
      </div>
    );
  }

  const statusBadge = getStatusBadge(subscription.status);
  const plan = subscription.plan;
  const isActive = subscription.status === "ACTIVE";
  const isPaused = subscription.status === "PAUSED";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Subscription Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-right">
                    {plan?.name ?? "—"}
                  </CardTitle>
                  <CardDescription className="text-right mt-1">
                    {plan?.description ?? "—"}
                  </CardDescription>
                </div>
                <Badge
                  variant="default"
                  className={`${statusBadge.className} gap-1 text-sm px-4 py-2`}
                >
                  {isActive ? (
                    <CheckCircle2 className="size-3" />
                  ) : isPaused ? (
                    <Pause className="size-3" />
                  ) : (
                    <XCircle className="size-3" />
                  )}
                  {statusBadge.text}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <DollarSign className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      السعر الشهري
                    </p>
                    <p className="text-lg font-bold">
                      {plan?.monthly_price
                        ? formatCurrency(plan.monthly_price)
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <CreditCard className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      السعر السنوي
                    </p>
                    <p className="text-lg font-bold">
                      {plan?.yearly_price
                        ? formatCurrency(plan.yearly_price)
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Subscription Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Calendar className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">تاريخ البدء</p>
                    <p className="text-lg font-bold">
                      {formatDate(subscription.start_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Calendar className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      تاريخ الانتهاء
                    </p>
                    <p className="text-lg font-bold">
                      {formatDate(subscription.end_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules Card */}
          {plan?.modules && plan.modules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Settings className="size-5" />
                  الوحدات المتاحة ({plan.modules.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {plan.modules.map((module: any) => (
                    <Badge
                      key={module.id}
                      variant="outline"
                      className="justify-center py-2 px-4 text-sm"
                    >
                      {module.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features Card */}
          {plan?.features && plan.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Package className="size-5" />
                  المميزات ({plan.features.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.features.map((feature: any, index: number) => (
                    <div
                      key={feature.id || index}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      <CheckCircle2 className="size-5 text-green-600 mt-0.5 shrink-0" />
                      <div className="text-right">
                        <p className="font-medium">{feature.name ?? "—"}</p>
                        {feature.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {feature.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">معلومات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم الاشتراك
                </span>
                <Badge variant="secondary" className="text-sm">
                  #{subscription.id.slice(0, 8)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الأيام المتبقية
                </span>
                <Badge variant="secondary" className="text-sm">
                  {subscription.remainingDays}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الحالة
                </span>
                <Badge
                  variant="default"
                  className={`${statusBadge.className} gap-1 text-sm`}
                >
                  {statusBadge.text}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  عدد الوحدات
                </span>
                <span className="text-sm">{plan?.modules?.length ?? 0}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  عدد المميزات
                </span>
                <span className="text-sm">{plan?.features?.length ?? 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {isPaused ? (
                <Button className="w-full gap-2" variant="default">
                  <Play className="size-4" />
                  استئناف الاشتراك
                </Button>
              ) : (
                <Button className="w-full gap-2" variant="secondary">
                  <Pause className="size-4" />
                  إيقاف الاشتراك
                </Button>
              )}
              <Button className="w-full gap-2" variant="default">
                <RefreshCw className="size-4" />
                تجديد الاشتراك
              </Button>
              <Button
                onClick={() => navigate("/plans")}
                className="w-full gap-2"
                variant="secondary"
              >
                <Pencil className="size-4" />
                تغيير الخطة
              </Button>
              <Button className="w-full gap-2" variant="destructive">
                <Trash2 className="size-4" />
                إلغاء الاشتراك
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
