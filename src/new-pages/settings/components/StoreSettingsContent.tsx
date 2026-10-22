import StorePlanSummaryCard from "./StorePlanSummaryCard";
import StoreIntegrationsSection from "./StoreIntegrationsSection";
import StoreSubscriptionSection from "./StoreSubscriptionSection";
import PoliciesSection from "./PoliciesSection";
import StorePixelsSection from "./StorePixelsSection";
import PlanUsageSection from "./PlanUsageSection";
import { usePlanUsage } from "@/hooks/use-plan-limits";
import { isFrozenPhase } from "@/utils/subscription-lifecycle";

const StoreSettingsContent = () => {
  const { data } = usePlanUsage();
  const frozen = isFrozenPhase(data?.subscription?.lifecyclePhase);

  // FROZEN: only renew/pay + support are allowed on the API — hide sections
  // that would 402 and leave the subscription card front and center.
  if (frozen) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <StoreSubscriptionSection />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-4">
        <StorePlanSummaryCard />
        <StoreIntegrationsSection />
        <StorePixelsSection />
      </div>

      <div className="flex flex-col gap-[18px] xl:col-span-8">
        <StoreSubscriptionSection />
        <PlanUsageSection />
        <PoliciesSection />
      </div>
    </div>
  );
};

export default StoreSettingsContent;
