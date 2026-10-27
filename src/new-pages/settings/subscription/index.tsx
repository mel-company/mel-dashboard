import { useState } from "react";
import { Loader2 } from "lucide-react";
import SettingsCard from "@/new-pages/settings/components/SettingsCard";
import { useFetchStoreSubscription } from "@/api/wrappers/subscription.wrapper";
import CurrentPlanSection from "./components/CurrentPlanSection";
import PlansTableSection, {
  type ChosenPlan,
} from "./components/PlansTableSection";
import { periodDiscount } from "./components/plan-pricing";
import UsageSection from "./components/UsageSection";
import PaymentHistorySection from "./components/PaymentHistorySection";
import PlanCheckoutDialog from "./components/PlanCheckoutDialog";
import SubscriptionDialog from "./components/SubscriptionDialog";

type Checkout = {
  type: "RENEWAL" | "CHANGE_PLAN";
  plan: Omit<ChosenPlan, "billingPeriod"> &
    Partial<Pick<ChosenPlan, "billingPeriod">>;
};

/**
 * Settings → «الاشتراك»: the plan with days to renewal, renew and
 * change-plan, beside the plan's limits. The plans side by side and the payment
 * history open in dialogs, so the tab stays short.
 */
const SubscriptionSettingsContent = () => {
  const { data: subscription, isLoading } = useFetchStoreSubscription();
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [plansOpen, setPlansOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);

  const currentPlan = subscription?.plan
    ? {
        id: subscription.plan.id as string,
        name: subscription.plan.name as string,
        discounts: {
          QUARTERLY: periodDiscount(subscription.plan, "QUARTERLY"),
          YEARLY: periodDiscount(subscription.plan, "YEARLY"),
        },
      }
    : null;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-start gap-[18px] lg:grid-cols-2">
      <div>
        {subscription ? (
          <CurrentPlanSection
            subscription={subscription}
            onRenew={() =>
              currentPlan && setCheckout({ type: "RENEWAL", plan: currentPlan })
            }
            onChangePlan={() => setPlansOpen(true)}
            onShowPayments={() => setPaymentsOpen(true)}
          />
        ) : (
          <SettingsCard title="الاشتراك">
            <p className="text-sm text-slate-500">
              لا يوجد اشتراك لهذا المتجر.
            </p>
            <button
              type="button"
              className="mt-3 text-sm text-blue-600 underline"
              onClick={() => setPlansOpen(true)}
            >
              اختر باقة
            </button>
          </SettingsCard>
        )}
      </div>

      <UsageSection />

      <SubscriptionDialog
        open={plansOpen}
        onOpenChange={setPlansOpen}
        title="الباقات"
        description="اختر باقة للتجديد أو التبديل."
        className="sm:max-w-3xl"
      >
        <PlansTableSection
          currentPlanId={currentPlan?.id ?? null}
          onChoose={(plan) => {
            setPlansOpen(false);
            setCheckout({
              type: plan.id === currentPlan?.id ? "RENEWAL" : "CHANGE_PLAN",
              plan,
            });
          }}
        />
      </SubscriptionDialog>

      <SubscriptionDialog
        open={paymentsOpen}
        onOpenChange={setPaymentsOpen}
        title="سجل المدفوعات"
        className="sm:max-w-3xl"
      >
        <PaymentHistorySection />
      </SubscriptionDialog>

      {/* Keyed so each checkout starts on the monthly period. */}
      <PlanCheckoutDialog
        key={
          checkout
            ? `${checkout.type}-${checkout.plan.id}-${checkout.plan.billingPeriod ?? ""}`
            : "closed"
        }
        open={!!checkout}
        onOpenChange={(open) => !open && setCheckout(null)}
        type={checkout?.type ?? "RENEWAL"}
        plan={checkout?.plan ?? null}
      />
    </div>
  );
};

export default SubscriptionSettingsContent;
