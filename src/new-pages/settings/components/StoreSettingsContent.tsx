import { useEffect, useState } from "react";
import StorePlanSummaryCard from "./StorePlanSummaryCard";
import StoreIntegrationsSection from "./StoreIntegrationsSection";
import PoliciesSection from "./PoliciesSection";
import SubscriptionInfoSection from "../subscription";
import { usePlanUsage } from "@/hooks/use-plan-limits";
import { isFrozenPhase } from "@/utils/subscription-lifecycle";

/** xl breakpoint — keep one SubscriptionInfoSection mounted so ?plans=1 opens once. */
function useIsXl() {
  const [isXl, setIsXl] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1280px)").matches
      : true,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const onChange = () => setIsXl(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isXl;
}

const StoreSettingsContent = () => {
  const { data } = usePlanUsage();
  const frozen = isFrozenPhase(data?.subscription?.lifecyclePhase);
  const isXl = useIsXl();

  // FROZEN: only renew/pay + support are allowed on the API — hide sections
  // that would 402 and leave the subscription card front and center.
  if (frozen) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <SubscriptionInfoSection />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-4">
        <StorePlanSummaryCard />
        {/* Phone: plan details follow the summary card. */}
        {!isXl ? <SubscriptionInfoSection /> : null}
        <StoreIntegrationsSection />
      </div>

      <div className="flex flex-col gap-[18px] xl:col-span-8">
        {isXl ? <SubscriptionInfoSection /> : null}
        <PoliciesSection />
      </div>
    </div>
  );
};

export default StoreSettingsContent;
