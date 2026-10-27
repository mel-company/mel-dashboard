import { useState } from "react";
import { Loader2 } from "lucide-react";
import SettingsCard from "@/new-pages/settings/components/SettingsCard";
import StorePlanSummaryCard from "@/new-pages/settings/components/StorePlanSummaryCard";
import { useFetchStoreSubscription } from "@/api/wrappers/subscription.wrapper";
import CurrentPlanSection from "./components/CurrentPlanSection";
import PlansTableSection from "./components/PlansTableSection";
import UsageSection from "./components/UsageSection";
import CreditsSection from "./components/CreditsSection";
import PaymentHistorySection from "./components/PaymentHistorySection";
import PlanCheckoutDialog from "./components/PlanCheckoutDialog";

type Checkout = {
  type: "RENEWAL" | "CHANGE_PLAN";
  plan: { id: string; name: string };
};

/**
 * Settings → «الاشتراك»: the plan, renewing it for 1, 3 or 12 months,
 * switching plans, usage against the plan's limits, AI credits and past
 * payments, laid out like the other settings tabs.
 *
 * It used to be one card in the store tab, with monthly renewal only and no
 * history.
 */
const SubscriptionSettingsContent = () => {
  const { data: subscription, isLoading } = useFetchStoreSubscription();
  const [checkout, setCheckout] = useState<Checkout | null>(null);

  const currentPlan = subscription?.plan
    ? { id: subscription.plan.id as string, name: subscription.plan.name as string }
    : null;
  const upgradeTo =
    subscription?.upgradeTo?.planId && subscription.upgradeTo.planId !== currentPlan?.id
      ? {
          id: subscription.upgradeTo.planId as string,
          name: subscription.upgradeTo.planName as string,
        }
      : null;
  const openUpgrade = upgradeTo
    ? () => setCheckout({ type: "CHANGE_PLAN", plan: upgradeTo })
    : undefined;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-4">
        <StorePlanSummaryCard />
        <CreditsSection />
      </div>

      <div className="flex flex-col gap-[18px] xl:col-span-8">
        {subscription ? (
          <CurrentPlanSection
            subscription={subscription}
            onRenew={() =>
              currentPlan && setCheckout({ type: "RENEWAL", plan: currentPlan })
            }
            onUpgrade={openUpgrade}
            upgradeName={upgradeTo?.name}
          />
        ) : (
          <SettingsCard title="معلومات الاشتراك">
            <p className="text-sm text-slate-500">
              لا يوجد اشتراك لهذا المتجر. اختر باقة من الجدول أدناه.
            </p>
          </SettingsCard>
        )}
        <UsageSection onUpgrade={openUpgrade} />
        <PlansTableSection
          currentPlanId={currentPlan?.id ?? null}
          onChoose={(plan) =>
            setCheckout({
              type: plan.id === currentPlan?.id ? "RENEWAL" : "CHANGE_PLAN",
              plan,
            })
          }
        />
        <PaymentHistorySection />
      </div>

      {/* Keyed so each checkout starts on the monthly period. */}
      <PlanCheckoutDialog
        key={checkout ? `${checkout.type}-${checkout.plan.id}` : "closed"}
        open={!!checkout}
        onOpenChange={(open) => !open && setCheckout(null)}
        type={checkout?.type ?? "RENEWAL"}
        plan={checkout?.plan ?? null}
      />
    </div>
  );
};

export default SubscriptionSettingsContent;
