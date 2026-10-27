import { useNavigate } from "react-router-dom";
import StorePlanSummaryCard from "./StorePlanSummaryCard";
import StoreIntegrationsSection from "./StoreIntegrationsSection";
import PoliciesSection from "./PoliciesSection";
import StorePixelsSection from "./StorePixelsSection";
import SettingsCard from "./SettingsCard";
import { Button } from "@/components/ui/button";

/**
 * The plan card that used to live here (renew, usage, cancel) moved to its own
 * page, `/subscription`, which is in the sidebar. This points there.
 */
const SubscriptionLinkCard = () => {
  const navigate = useNavigate();
  return (
    <SettingsCard title="الاشتراك">
      <div className="flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 text-sm text-slate-600 dark:text-slate-300">
          تجديد الباقة أو تغييرها، الاستهلاك، رصيد الذكاء الاصطناعي وسجل
          المدفوعات في صفحة الاشتراك.
        </p>
        <Button
          className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => navigate("/subscription")}
        >
          إدارة الاشتراك
        </Button>
      </div>
    </SettingsCard>
  );
};

const StoreSettingsContent = () => {
  return (
    <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-4">
        <StorePlanSummaryCard />
        <StoreIntegrationsSection />
        <StorePixelsSection />
      </div>

      <div className="flex flex-col gap-[18px] xl:col-span-8">
        <SubscriptionLinkCard />
        <PoliciesSection />
      </div>
    </div>
  );
};

export default StoreSettingsContent;
