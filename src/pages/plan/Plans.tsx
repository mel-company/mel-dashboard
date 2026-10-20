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
import { formatCurrency } from "@/utils/format-currency";

type Props = {};

const capLine = (limit: number | null | undefined, unit: string, plural: string) =>
  limit === null || limit === undefined
    ? `${plural} بلا حدود`
    : `حتى ${limit} ${unit}`;

/** The plan's grant in lines, from its columns (caps, AI, features). */
function planHighlights(plan: any): string[] {
  const lines = [
    capLine(plan.max_products, "منتج", "منتجات"),
    capLine(plan.max_categories, "قسم", "أقسام"),
    capLine(plan.max_category_groups, "مجموعة أقسام", "مجموعات أقسام"),
    capLine(plan.max_coupons, "كوبون", "كوبونات"),
    capLine(plan.max_monthly_orders, "طلب شهرياً", "طلبات"),
  ];
  if (plan.ai_store_credits > 0) {
    lines.push(`${plan.ai_store_credits} متاجر بالذكاء الاصطناعي شهرياً`);
  } else if (plan.ai_store_trial > 0) {
    lines.push("تجربة مجانية واحدة لإنشاء متجر بالذكاء الاصطناعي");
  }
  if (plan.has_ai_editor && plan.ai_editor_credits > 0) {
    lines.push(`${plan.ai_editor_credits} رصيد شهرياً لمساعد المحرر الذكي`);
  } else if (plan.ai_editor_trial > 0) {
    lines.push(`تجربة مساعد المحرر الذكي (${plan.ai_editor_trial} رسائل)`);
  }
  if (plan.has_social_pixels) lines.push("بكسلات الإعلانات (ميتا، تيك توك، سناب)");
  if (plan.has_custom_domain) lines.push("ربط نطاقك الخاص");
  return lines;
}

/** The intro offer in one line, or null when there is none. */
function introText(plan: any): string | null {
  const intro = plan.pricing?.monthly?.intro;
  if (!intro?.enabled) return null;
  const parts: string[] = [];
  if (intro.freeMonths > 0) {
    parts.push(intro.freeMonths === 1 ? "أول شهر مجاناً" : `أول ${intro.freeMonths} أشهر مجاناً`);
  }
  if (intro.discountMonths > 0 && intro.discountPercent > 0) {
    parts.push(
      `خصم ${intro.discountPercent}% لمدة ${intro.discountMonths === 1 ? "شهر" : `${intro.discountMonths} أشهر`}`,
    );
  }
  return parts.length ? `للمشتركين الجدد: ${parts.join("، ثم ")}` : null;
}

const Plans = ({}: Props) => {
  const navigate = useNavigate();

  const {
    data: plans,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchPlans();

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
                  className="bg-emerald-500/12 text-emerald-600 dark:bg-[#00dfa8]/12 dark:text-[#00dfa8] text-white gap-1 px-3 py-1"
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
                  <div className="text-right flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      3 أشهر
                      {plan.pricing?.quarterly?.discountPercent
                        ? ` (خصم ${plan.pricing.quarterly.discountPercent}%)`
                        : ""}
                      :{" "}
                      <span className="font-bold text-foreground">
                        {formatCurrency(
                          plan.pricing?.quarterly?.price ?? plan.monthly_price * 3,
                        )}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      سنة
                      {plan.pricing?.yearly?.discountPercent
                        ? ` (خصم ${plan.pricing.yearly.discountPercent}%)`
                        : ""}
                      :{" "}
                      <span className="font-bold text-foreground">
                        {formatCurrency(plan.yearly_price)}
                      </span>
                    </p>
                  </div>
                </div>
                {introText(plan) && (
                  <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {introText(plan)}
                  </p>
                )}
              </div>

              {/* What the plan includes, from its own columns. */}
              <ul className="space-y-1.5 text-sm">
                {planHighlights(plan).map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-right text-muted-foreground">{line}</span>
                  </li>
                ))}
              </ul>

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
                        key={feature.feature?.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="size-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-right text-muted-foreground">
                          {feature.feature?.name}
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
