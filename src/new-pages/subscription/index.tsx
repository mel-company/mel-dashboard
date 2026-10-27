import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AiMagicIcon,
  Analytics01Icon,
  Invoice01Icon,
  Layers01Icon,
} from "@hugeicons-pro/core-duotone-rounded";
import PagePanel from "@/components/PagePanel";
import TitleBar from "@/components/table/title-bar";
import SwitchTab from "@/components/table/switch-tab";
import SettingsCard from "@/new-pages/settings/components/SettingsCard";
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

type Tab = "usage" | "plans" | "credits" | "payments";

const TABS = [
  { value: "usage", label: "الاستهلاك", icon: Analytics01Icon },
  { value: "plans", label: "الباقات", icon: Layers01Icon },
  { value: "credits", label: "الرصيد", icon: AiMagicIcon },
  { value: "payments", label: "المدفوعات", icon: Invoice01Icon },
];

/**
 * Everything about the store's plan in one page: the plan at a glance with
 * renew and upgrade, then tabs for usage, the plans side by side, AI credits
 * and past payments.
 *
 * It used to be one card under the second tab of Settings, with monthly
 * renewal only and no history.
 */
const SubscriptionPage = () => {
  const { data: subscription, isLoading } = useFetchStoreSubscription();
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [tab, setTab] = useState<Tab>("usage");

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

  return (
    <PagePanel className="flex min-h-0 flex-col gap-4">
      <TitleBar description="راجع باقتك وجدّدها أو بدّلها، وتابع استهلاكك ومدفوعاتك" />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
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
            <SettingsCard title="باقتك الحالية">
              <p className="text-sm text-slate-500">
                لا يوجد اشتراك لهذا المتجر. اختر باقة من تبويب «الباقات».
              </p>
            </SettingsCard>
          )}

          <div className="-mx-1 flex justify-start overflow-x-auto px-1">
            <SwitchTab
              selected={tab}
              options={TABS}
              onChange={(value) => setTab(value as Tab)}
            />
          </div>

          {tab === "usage" && <UsageSection onUpgrade={openUpgrade} />}
          {tab === "plans" && (
            <PlansTableSection
              currentPlanId={currentPlan?.id ?? null}
              onChoose={(plan) =>
                setCheckout({
                  type: plan.id === currentPlan?.id ? "RENEWAL" : "CHANGE_PLAN",
                  plan,
                })
              }
            />
          )}
          {tab === "credits" && <CreditsSection />}
          {tab === "payments" && <PaymentHistorySection />}
        </>
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
