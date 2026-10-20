import { Lock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { LimitedResource } from "@/api/endpoints/plan.endpoints";
import { usePlanEntitlements } from "@/hooks/use-plan-entitlements";
import { usePlanLimit } from "@/hooks/use-plan-limits";
import { cn } from "@/lib/utils";

/** How each capped thing is counted, in the merchant's words. */
const UNITS: Record<LimitedResource, string> = {
  products: "منتج",
  categories: "قسم",
  categoryGroups: "مجموعة أقسام",
  coupons: "كوبون",
  monthlyOrders: "طلب هذا الشهر",
};

const TITLES: Record<LimitedResource, string> = {
  products: "المنتجات",
  categories: "الأقسام",
  categoryGroups: "مجموعات الأقسام",
  coupons: "الكوبونات",
  monthlyOrders: "الطلبات",
};

/** Past this share of a cap, the usage line shows before it is reached. */
const NEAR_SHARE = 0.8;

function reachedMessage(resource: LimitedResource, limit: number, plan: string) {
  if (resource === "monthlyOrders") {
    return `تجاوزت ${limit} طلب هذا الشهر، وهو حد باقتك. متجرك ما زال يستقبل كل الطلبات، رقِّ إلى باقة ${plan} لطلبات بلا حدود.`;
  }
  return `وصلت للحد الأقصى في باقتك (${limit} ${UNITS[resource]}). رقِّ إلى باقة ${plan} لإضافة ${TITLES[resource]} بلا حدود.`;
}

/**
 * A slim bar above a list that has a plan cap: the usage once it is close, and
 * an upgrade button once it is reached. Nothing on an unlimited plan.
 */
export function PlanLimitNotice({
  resource,
  className,
}: {
  resource: LimitedResource;
  className?: string;
}) {
  const usage = usePlanLimit(resource);
  const { goUpgrade, upgradeTo } = usePlanEntitlements();
  if (!usage || usage.limit === null) return null;
  const near = usage.used >= usage.limit * NEAR_SHARE;
  if (!usage.reached && !near) return null;
  const planName = upgradeTo?.planName || "نمو";

  return (
    <div
      dir="rtl"
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-sm",
        usage.reached
          ? "bg-amber-500/10 text-amber-800 dark:text-amber-300"
          : "bg-sky-500/10 text-sky-800 dark:text-sky-300",
        className,
      )}
    >
      <span className="min-w-0 flex-1 font-medium leading-relaxed">
        {usage.reached
          ? reachedMessage(resource, usage.limit, planName)
          : `استخدمت ${usage.used} من ${usage.limit} ${UNITS[resource]} في باقتك.`}
      </span>
      <Button
        size="sm"
        className="gap-1.5 rounded-full"
        onClick={() => goUpgrade()}
      >
        <Sparkles className="size-4" />
        ترقية الباقة
      </Button>
    </div>
  );
}

/**
 * An add-form behind a cap: the form while there is room, an upgrade panel
 * once the store is at its cap — rather than letting the merchant fill the
 * whole form in and be refused on save.
 */
export function PlanLimitGate({
  resource,
  children,
}: {
  resource: Exclude<LimitedResource, "monthlyOrders">;
  children: ReactNode;
}) {
  const usage = usePlanLimit(resource);
  const { goUpgrade, upgradeTo } = usePlanEntitlements();
  if (!usage?.reached || usage.limit === null) return <>{children}</>;
  const planName = upgradeTo?.planName || "نمو";

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center"
      dir="rtl"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
        <Lock className="size-7" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          وصلت لحد {TITLES[resource]} في باقتك
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {reachedMessage(resource, usage.limit, planName)} كل ما أضفته يبقى كما
          هو.
        </p>
      </div>
      <Button
        size="lg"
        className="gap-2 rounded-full px-6"
        onClick={() => goUpgrade()}
      >
        <Sparkles className="size-4" />
        ترقية إلى {planName}
      </Button>
    </div>
  );
}
