import { useState } from "react";
import { Loader2 } from "lucide-react";
import PagePanel from "@/components/PagePanel";
import TitleBar from "@/components/table/title-bar";
import SettingsCard from "@/new-pages/settings/components/SettingsCard";
import PlanUsageSection from "@/new-pages/settings/components/PlanUsageSection";
import { useFetchStoreSubscription } from "@/api/wrappers/subscription.wrapper";
import CurrentPlanSection from "./components/CurrentPlanSection";
import PlansTableSection from "./components/PlansTableSection";
import CreditsSection from "./components/CreditsSection";
import PaymentHistorySection from "./components/PaymentHistorySection";
import PlanCheckoutDialog from "./components/PlanCheckoutDialog";

type Checkout = {
  type: "RENEWAL" | "CHANGE_PLAN";
  plan: { id: string; name: string };
};

/**
 * Everything about the store's plan in one page: what it is on, renewing it
 * for 1, 3 or 12 months, switching between plans, usage against the plan's
 * limits, AI credits and past payments.
 *
 * It used to be one card under the second tab of Settings, with monthly
 * renewal only and no history.
 */
const SubscriptionPage = () => {
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

  return (
    <PagePanel className="flex min-h-0 flex-col gap-4">
      <TitleBar description="راجع باقتك وجدّدها أو بدّلها، وتابع استهلاكك ومدفوعاتك" />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
          <div className="flex flex-col gap-4">
            {subscription ? (
              <CurrentPlanSection
                subscription={subscription}
                onRenew={() =>
                  currentPlan && setCheckout({ type: "RENEWAL", plan: currentPlan })
                }
                onUpgrade={
                  upgradeTo
                    ? () => setCheckout({ type: "CHANGE_PLAN", plan: upgradeTo })
                    : undefined
                }
                upgradeName={upgradeTo?.name}
              />
            ) : (
              <SettingsCard title="باقتك الحالية">
                <p className="text-sm text-slate-500">
                  لا يوجد اشتراك لهذا المتجر. اختر باقة من الجدول.
                </p>
              </SettingsCard>
            )}
            <PlanUsageSection
              onUpgrade={
                upgradeTo
                  ? () => setCheckout({ type: "CHANGE_PLAN", plan: upgradeTo })
                  : undefined
              }
            />
            <CreditsSection />
          </div>

          <div className="flex flex-col gap-4">
            <PlansTableSection
              currentPlanId={currentPlan?.id ?? null}
              onChoose={(plan) =>
                setCheckout({
                  type: plan.id === currentPlan?.id ? "RENEWAL" : "CHANGE_PLAN",
                  plan,
                })
              }
            />
          </div>
          <div className="xl:col-span-2">
            <PaymentHistorySection />
          </div>
        </div>
      )}

      {/* Keyed so each checkout starts on the monthly period. */}
      <PlanCheckoutDialog
        key={checkout ? `${checkout.type}-${checkout.plan.id}` : "closed"}
        open={!!checkout}
        onOpenChange={(open) => !open && setCheckout(null)}
        type={checkout?.type ?? "RENEWAL"}
        plan={checkout?.plan ?? null}
      />
    </PagePanel>
  );
};

export default SubscriptionPage;
