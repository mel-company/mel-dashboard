import StorePlanSummaryCard from "./StorePlanSummaryCard";
import StoreIntegrationsSection from "./StoreIntegrationsSection";
import StoreSubscriptionSection from "./StoreSubscriptionSection";
import PoliciesSection from "./PoliciesSection";

const StoreSettingsContent = () => {
  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
      {/* يمين: الباقة + النطاق + الدفع + التوصيل */}
      <div className="space-y-4 xl:col-span-4">
        <StorePlanSummaryCard />
        <StoreIntegrationsSection />
      </div>

      {/* يسار: الاشتراك + سياسة المتجر */}
      <div className="space-y-4 xl:col-span-8">
        <StoreSubscriptionSection />
        <PoliciesSection />
      </div>
    </div>
  );
};

export default StoreSettingsContent;
