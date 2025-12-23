import { useFetchPlans } from "@/api/wrappers/plan.wrappers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  Star,
  Users,
  Settings,
  Sparkles,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import PlansSkeleton from "./PlansSkeleton";
import ErrorPage from "../miscellaneous/ErrorPage";
import { useNavigate } from "react-router-dom";

type Props = {};

const Plans = ({}: Props) => {
  const navigate = useNavigate();

  const {
    data: plans,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchPlans();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "currency",
      currency: "IQD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <PlansSkeleton />;
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

  if (!plans || (Array.isArray(plans) && plans.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">لا توجد خطط متاحة</h2>
        <p className="text-muted-foreground">
          لا توجد خطط اشتراك متاحة حالياً.
        </p>
      </div>
    );
  }

  // Handle both array and paginated response
  const plansList = Array.isArray(plans) ? plans : plans.data || [];
  const currentPlanId = plans?.currentPlan?.planId || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-right">خطط الاشتراك</h1>
          <p className="text-muted-foreground text-right mt-1">
            اختر الخطة المناسبة لمتجرك
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plansList.map((plan: any) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col transition-all hover:shadow-lg ${
              plan.most_popular ? "border-primary border-2 shadow-md" : ""
            } ${!plan.enabled ? "opacity-60" : ""}`}
          >
            {plan.most_popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge
                  variant="default"
                  className="bg-primary text-primary-foreground gap-1 px-3 py-1"
                >
                  <Sparkles className="size-3" />
                  الأكثر شعبية
                </Badge>
              </div>
            )}

            {currentPlanId === plan.id && (
              <div className="absolute -top-3 right-4 z-10">
                <Badge
                  variant="default"
                  className="bg-green-600 text-white gap-1 px-3 py-1"
                >
                  <CheckCircle className="size-3" />
                  خطتك الحالية
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="text-right flex-1">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-right">
                    {plan.description}
                  </CardDescription>
                </div>
                {!plan.enabled && (
                  <Badge variant="outline" className="gap-1">
                    <XCircle className="size-3" />
                    معطل
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col space-y-4">
              {/* Pricing */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <DollarSign className="size-5 text-primary shrink-0" />
                  <div className="text-right flex-1">
                    <p className="text-sm text-muted-foreground">
                      السعر الشهري
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(plan.monthly_price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <Package className="size-5 text-primary shrink-0" />
                  <div className="text-right flex-1">
                    <p className="text-sm text-muted-foreground">
                      السعر السنوي
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(plan.yearly_price)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Subscription Count */}
              {plan._count && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  <span>{plan._count.subscriptions || 0} اشتراك نشط</span>
                </div>
              )}

              {/* Modules */}
              {plan.modules && plan.modules.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
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
              )}

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Star className="size-4" />
                    <span>المميزات ({plan.features.length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                    {plan.features.map((feature: any) => (
                      <div
                        key={feature.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="size-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-right text-muted-foreground">
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state for features and modules */}
              {(!plan.features || plan.features.length === 0) &&
                (!plan.modules || plan.modules.length === 0) && (
                  <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground py-4">
                    لا توجد وحدات أو مميزات متاحة
                  </div>
                )}
            </CardContent>

            {currentPlanId !== plan.id && plan.enabled && (
              <CardFooter className="pt-0">
                <Button
                  // onClick={() => handleChangePlan(plan.id)}
                  onClick={() => navigate(`/payment/${plan.id}`)}
                  className="w-full gap-2"
                  variant="default"
                >
                  <>
                    إختيار
                    <ArrowLeft className="size-4" />
                  </>
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Plans;
